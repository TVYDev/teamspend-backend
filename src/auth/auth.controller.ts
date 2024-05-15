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
import { TokenType, User } from '@prisma/client';

import { TokensService } from '@/tokens/tokens.service';
import { ForbiddenResourceException } from '@/lib/exceptions/forbidden-resource.exception';
import { UsersService } from '@/users/users.service';
import { AuthService } from './auth.service';
import { AuthenticatedRequest, RefreshTokenJwtPayload } from './auth.interface';
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from './auth.decorator';
import { SignUpDto } from './dto/sign-up.dto';
import { RefreshTokenGuard } from './refresh-token.guard';
import { authCookieName } from './constants';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private tokensService: TokensService,
    private usersService: UsersService
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Req() req: Request & { user: User },
    @Res({ passthrough: true }) res: Response
  ) {
    const resultLoginData = await this.authService.login(req.user);

    this.authService.setAuthCookie(res, resultLoginData);

    return resultLoginData;
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('sign-up')
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const createdUser = await this.authService.signUp(signUpDto);
    const resultLoginData = await this.authService.login(createdUser);

    this.authService.setAuthCookie(res, resultLoginData);

    return resultLoginData;
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

    if (decodedRefreshTokenPayload.tokenId) {
      const activeToken = await this.tokensService.findActiveTokenByIdAndType(
        decodedRefreshTokenPayload.tokenId,
        TokenType.REFRESH_TOKEN
      );

      if (activeToken) {
        const user = await this.usersService.findActiveUserById(
          activeToken.subject_id
        );

        if (user) {
          const resultLoginData = await this.authService.login(user);

          this.authService.setAuthCookie(res, resultLoginData);

          await this.tokensService.revokeTokenById(activeToken.id);

          return resultLoginData;
        }
      }
    }

    throw new ForbiddenResourceException();
  }
}
