import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';

import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from './interfaces/authenticated-request';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './auth.decorator';

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

    res.cookie('access_token', responseData.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });

    return responseData;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: AuthenticatedRequest) {
    return req.user || null;
  }
}
