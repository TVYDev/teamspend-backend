import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { SessionType } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';

import { SessionsService } from '@/sessions/sessions.service';
import { ForbiddenResourceException } from '@/lib/exceptions/forbidden-resource.exception';
import { getDeviceInfoFromHeaders } from '@/lib/helpers/request';
import { NotFoundResourceException } from '@/lib/exceptions/not-found-resource.exception';
import { UsersService } from '@/users/users.service';
import { CryptoService } from '@/crypto/crypto.service';
import { InvalidRequestPayloadException } from '@/lib/exceptions/invalid-request-payload.exception';
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
import { LogInDto } from './dto/log-in.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private sessionsService: SessionsService,
    private usersService: UsersService,
    private cryptoService: CryptoService
  ) {}

  /**
   * LOG IN
   */
  @ApiOperation({ summary: 'Log in' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has logged in successfully',
  })
  @ApiBody({ type: LogInDto })
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

  /**
   * SIGN UP
   */
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

  /**
   * GET PROFILE
   */
  @ApiOperation({ summary: 'Get profile information of the current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user profile has been successfully retrieved',
  })
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Req() req: AuthenticatedRequest) {
    return req.user || null;
  }

  /**
   * REFRESH TOKEN
   */
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The access token has been successfully refreshed',
  })
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

  /**
   * LOG OUT
   */
  @ApiOperation({ summary: 'Log out' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has logged out successfully',
  })
  @ApiBearerAuth()
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

  /**
   * GET SESSIONS
   */
  @ApiOperation({ summary: 'Get all active sessions of the current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user sessions have been successfully retrieved',
  })
  @ApiBearerAuth()
  @Get('sessions')
  @HttpCode(HttpStatus.OK)
  sessions(@Req() req: AuthenticatedRequest) {
    return this.sessionsService.findActiveSessionsOfUser(req.user);
  }

  /**
   * REVOKE SESSION
   */
  @ApiOperation({ summary: 'Revoke a session of the current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user session has been successfully revoked',
  })
  @ApiBearerAuth()
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

  /**
   * CHANGE PASSWORD
   */
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user password has been successfully changed',
  })
  @ApiBearerAuth()
  @Post('password/change')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    let decryptedOldPassword = '';
    let decryptedNewPassword = '';
    try {
      decryptedOldPassword = this.cryptoService.decryptRsa(
        changePasswordDto.old_password
      );
      decryptedNewPassword = this.cryptoService.decryptRsa(
        changePasswordDto.new_password
      );
    } catch {
      throw new InvalidRequestPayloadException();
    }

    const isNewAndOldPasswordTheSame =
      decryptedOldPassword === decryptedNewPassword;
    if (isNewAndOldPasswordTheSame) {
      throw new InvalidRequestPayloadException(
        'New password is the same as old password'
      );
    }

    const user = await this.usersService.findActiveUserById(req.user.id);
    const isOldPasswordCorrect =
      user && (await bcrypt.compare(decryptedOldPassword, user.password));
    if (!isOldPasswordCorrect) {
      throw new InvalidRequestPayloadException('Old password is incorrect');
    }

    await this.usersService.changePassword(req.user, decryptedNewPassword);

    await this.sessionsService.revokeAllSessionsOfUser(req.user);
  }

  /**
   * FORGOT PASSWORD
   */
  @ApiOperation({ summary: 'Forgot password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'The user has been successfully notified about the password reset',
  })
  @Public()
  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findActiveUserByEmail(
      forgotPasswordDto.email
    );

    if (user) {
      const _resetPasswordSession = await this.sessionsService.createSession({
        user_id: user.id,
        type: SessionType.RESET_PWD,
        expired_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // TODO: Refactor this static 3 days
      });

      // TODO: Send email with reset password link
    }
  }

  /**
   * RESET PASSWORD
   */
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user password has been successfully reset',
  })
  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Query('token') token: string
  ) {
    const tokenInvalidException = new InvalidRequestPayloadException(
      'Token is invalid'
    );

    if (!token) {
      throw tokenInvalidException;
    }

    const resetPasswordSession =
      await this.sessionsService.findActiveSessionByIdAndType(
        token,
        SessionType.RESET_PWD
      );
    if (!resetPasswordSession) {
      throw tokenInvalidException;
    }

    let decryptedNewPassword = '';
    try {
      decryptedNewPassword = this.cryptoService.decryptRsa(
        resetPasswordDto.new_password
      );
    } catch {
      throw new InvalidRequestPayloadException();
    }

    const user = await this.usersService.findActiveUserById(
      resetPasswordSession.user__id
    );

    if (!user) {
      throw tokenInvalidException;
    }

    await this.usersService.changePassword(user, decryptedNewPassword);

    await this.sessionsService.revokeSessionById(resetPasswordSession.id);
  }
}
