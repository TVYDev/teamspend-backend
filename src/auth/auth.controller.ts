import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { GetAccessTokenDto } from './dto/get-access-token.dto';
import { AuthGuard } from './auth.guard';
import { SkipAuth } from './auth.decorator';
import { AuthenticatedRequest } from './interfaces/authenticated-request';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @Post('token')
  getAccessToken(@Body() getAccessTokenDto: GetAccessTokenDto) {
    return this.authService.getAccessToken(
      getAccessTokenDto.email,
      getAccessTokenDto.password
    );
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() request: AuthenticatedRequest) {
    return request.user || null;
  }
}
