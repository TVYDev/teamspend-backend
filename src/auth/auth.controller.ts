import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { SessionType } from '@prisma/client';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { SessionsService } from '@/sessions/sessions.service';
import { ForbiddenResourceException } from '@/lib/exceptions/forbidden-resource.exception';
import { getDeviceInfoFromHeaders } from '@/lib/helpers/request';
import { UsersService } from '@/users/users.service';
import { AuthService } from './auth.service';
import {
  AccessTokenJwtPayload,
  AuthenticatedRequest,
  RefreshTokenJwtPayload,
} from './auth.interface';
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from './auth.decorator';
import { SignUpDto } from './dto/sign-up.dto';
import { RefreshTokenGuard } from './refresh-token.guard';
import { authCookieName } from './constants';
import { RevokeSessionDto } from './dto/revoke-session.dto';
import { RestrictedSelfSessionRevocationException } from './exceptions/restricted-self-session-revocation.exception';
import { NotFoundResourceException } from '@/lib/exceptions/not-found-resource.exception';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private sessionsService: SessionsService,
    private usersService: UsersService
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const deviceInfo = getDeviceInfoFromHeaders(req.headers);
    const resultLoginData = await this.authService.login(req.user, deviceInfo);
    await this.authService.enforceNumberOfActiveSessionsOfUser(req.user);

    this.authService.setAuthCookie(res, resultLoginData);

    const { refresh_token: _, ...returnedResultLoginData } = resultLoginData;
    return returnedResultLoginData;
  }

  @ApiOperation({ summary: 'Sign up' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has signed up successfully',
  })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('sign-up')
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const createdUser = await this.authService.signUp(signUpDto);
    const deviceInfo = getDeviceInfoFromHeaders(req.headers);
    const resultLoginData = await this.authService.login(
      createdUser,
      deviceInfo
    );

    this.authService.setAuthCookie(res, resultLoginData);

    const { refresh_token: _, ...returnedResultLoginData } = resultLoginData;
    return returnedResultLoginData;
  }

  @Get('profile')
  getProfile(@Req() req: AuthenticatedRequest) {
    return req.user || null;
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('token/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshTokenJwt = req.cookies[authCookieName.REFRESH_TOKEN];
    const decodedRefreshTokenPayload =
      this.jwtService.decode<RefreshTokenJwtPayload>(refreshTokenJwt);

    if (decodedRefreshTokenPayload.sessionId) {
      const activeSession =
        await this.sessionsService.findActiveSessionByIdAndType(
          decodedRefreshTokenPayload.sessionId,
          SessionType.LOGIN
        );

      if (activeSession) {
        const user = await this.usersService.findActiveUserById(
          activeSession.user__id
        );

        if (user) {
          const deviceInfo = getDeviceInfoFromHeaders(req.headers);
          const resultLoginData = await this.authService.login(
            user,
            deviceInfo
          );

          this.authService.setAuthCookie(res, resultLoginData);

          await this.sessionsService.revokeSessionById(activeSession.id);

          const { refresh_token: _, ...returnedResultLoginData } =
            resultLoginData;
          return returnedResultLoginData;
        }
      }
    }

    throw new ForbiddenResourceException();
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const accessTokenJwt = req.cookies[authCookieName.ACCESS_TOKEN];
    const decodedAccessTokenPayload =
      this.jwtService.decode<AccessTokenJwtPayload>(accessTokenJwt);

    if (decodedAccessTokenPayload.sessionId) {
      await this.sessionsService.revokeSessionById(
        decodedAccessTokenPayload.sessionId
      );
    }

    this.authService.clearAuthCookie(res);
  }

  @Get('sessions')
  @HttpCode(HttpStatus.OK)
  sessions(@Req() req: AuthenticatedRequest) {
    return this.sessionsService.findActiveSessionsOfUser(req.user);
  }

  @Post('sessions/revoke')
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @Req() req: AuthenticatedRequest,
    @Body() revokeSessionDto: RevokeSessionDto
  ) {
    const accessTokenJwt = req.cookies[authCookieName.ACCESS_TOKEN];
    const decodedAccessTokenPayload =
      this.jwtService.decode<AccessTokenJwtPayload>(accessTokenJwt);

    if (decodedAccessTokenPayload.sessionId === revokeSessionDto.id) {
      throw new RestrictedSelfSessionRevocationException();
    }

    const activeSession =
      await this.sessionsService.findActiveSessionByIdAndType(
        revokeSessionDto.id,
        SessionType.LOGIN
      );

    if (!activeSession) {
      throw new NotFoundResourceException();
    }

    await this.sessionsService.revokeSessionByIdAndUser(
      revokeSessionDto.id,
      req.user
    );
  }
}
