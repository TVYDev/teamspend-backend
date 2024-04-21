import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '@/users/users.service';
import { AccessTokenJwtPayload } from './interfaces/access-token-jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async getAccessToken(email: string, _password: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new UnauthorizedException();
    }

    const jwtPayload: AccessTokenJwtPayload = {
      email: user.email,
      sub: user.id,
    };

    return {
      access_token: await this.jwtService.signAsync(jwtPayload),
    };
  }
}
