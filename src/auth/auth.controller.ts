import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';

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
  async login(@Request() request: Request & { user: User }) {
    return this.authService.login(request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() request: AuthenticatedRequest) {
    return request.user || null;
  }
}
