import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

import { User } from '@prisma/client';
import { UsersService } from '@/users/users.service';
import { CryptoService } from '@/crypto/crypto.service';
import { IncorrectUserCredentialsException } from '@/exceptions/incorrect-user-credentials.exception';
import { InvalidRequestPayloadException } from '@/exceptions/invalid-request-payload.exception';
import { AccessTokenJwtPayload } from './interfaces/access-token-jwt-payload.interface';
import { SignUpDto } from './dto/sign-up.dto';
import { authCookieName } from './constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private cryptoService: CryptoService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findActiveUserByEmail(email);
    if (user) {
      let decryptedPassword = '';

      try {
        decryptedPassword = this.cryptoService.decryptRsa(password);
      } catch {
        throw new IncorrectUserCredentialsException();
      }

      const isPasswordCorrect = await bcrypt.compare(
        decryptedPassword,
        user.password
      );

      if (isPasswordCorrect) {
        return user;
      }
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
    const username = await this.usersService.generateUsername();
    let decryptedPassword = '';

    try {
      decryptedPassword = this.cryptoService.decryptRsa(signUpDto.password);
    } catch {
      throw new InvalidRequestPayloadException();
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(decryptedPassword, salt);

    return this.usersService.createUser({
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
