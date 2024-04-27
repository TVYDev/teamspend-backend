import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '@/users/users.service';
import { AccessTokenJwtPayload } from './interfaces/access-token-jwt-payload.interface';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, _password: string) {
    const user = await this.usersService.findOne(email);
    if (user) {
      // TODO: Not to return password
      return user;
    }

    return null;
  }

  async login(user: User) {
    const payload: AccessTokenJwtPayload = {
      email: user.email,
      sub: user.id,
    };

    return { access_token: this.jwtService.sign(payload) };
  }
}
