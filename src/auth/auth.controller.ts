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

import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from './interfaces/authenticated-request';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './auth.decorator';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Req() req: Request & { user: User },
    @Res({ passthrough: true }) res: Response
  ) {
    const responseData = await this.authService.login(req.user);

    this.authService.setAuthCookie(res, responseData.access_token);

    return responseData;
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

    this.authService.setAuthCookie(res, resultLoginData.access_token);

    return resultLoginData;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: AuthenticatedRequest) {
    return req.user || null;
  }
}
