import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

import { User } from '@prisma/client';
import { UsersService } from '@/users/users.service';
import { AccessTokenJwtPayload } from './interfaces/access-token-jwt-payload.interface';
import { SignUpDto } from './dto/sign-up.dto';
import { authCookieName } from './constants';

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

  async signUp(signUpDto: SignUpDto) {
    /**
     * TODO: user password with RSA
     */
    const username = `user_${Date.now()}`;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(signUpDto.password, salt);

    return this.usersService.create({
      ...signUpDto,
      password: hashedPassword,
      username,
    });
  }

  setAuthCookie(res: Response, accessToken: string) {
    res.cookie(authCookieName.accessToken, accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      expires: new Date(Date.now() + 1000 * 60 * 10), // TODO: Get from Redis config 10mn
      maxAge: 1000 * 60 * 10, // TODO: Get from Redis config 10mn
    });
  }
}
