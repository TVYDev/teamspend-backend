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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('token')
  getAccessToken(@Body() getAccessTokenDto: GetAccessTokenDto) {
    return this.authService.getAccessToken(
      getAccessTokenDto.email,
      getAccessTokenDto.password
    );
  }

  //TODO: update with new interface of Request object with user property
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() request: Request) {
    return 'user' in request ? request.user : null;
  }
}
