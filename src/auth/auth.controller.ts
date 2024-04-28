import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from './interfaces/authenticated-request';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './auth.decorator';
import { authCookieName } from './constants';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: Request & { user: User },
    @Res({ passthrough: true }) res: Response
  ) {
    const responseData = await this.authService.login(req.user);

    res.cookie(authCookieName.accessToken, responseData.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      expires: new Date(Date.now() + 1000 * 60 * 10), // TODO: Get from Redis config 10mn
      maxAge: 1000 * 60 * 10, // TODO: Get from Redis config 10mn
    });

    return responseData;
  }

  @Public()
  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    // TODO: return access token upon success create
    return this.authService.signUp(signUpDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: AuthenticatedRequest) {
    return req.user || null;
  }
}
