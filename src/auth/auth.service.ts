import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CookieOptions, Response } from 'express';

import { SessionType, User } from '@prisma/client';
import { UsersService } from '@/users/users.service';
import { CryptoService } from '@/crypto/crypto.service';
import { SessionsService } from '@/sessions/sessions.service';
import { IncorrectUserCredentialsException } from '@/lib/exceptions/incorrect-user-credentials.exception';
import { InvalidRequestPayloadException } from '@/lib/exceptions/invalid-request-payload.exception';
import { DeviceInfo } from '@/lib/interfaces/request';
import {
  AccessTokenJwtPayload,
  NewJwtTokenResponse,
  RefreshTokenJwtPayload,
} from './auth.interface';
import { SignUpDto } from './dto/sign-up.dto';
import { authCookieName } from './constants';

const ACCESS_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  expires: new Date(Date.now() + 1000 * 60 * 10), // TODO: Get from Redis config 10mn
  maxAge: 1000 * 60 * 10, // TODO: Get from Redis config 10mn
};

const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // TODO: Get from Redis config 7 days
  maxAge: 1000 * 60 * 60 * 24 * 7, // TODO: Get from Redis config 7 days
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private sessionsService: SessionsService
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

  async login(user: User, deviceInfo: DeviceInfo) {
    const session = await this.sessionsService.createSession({
      user_id: user.id,
      type: SessionType.LOGIN,
      expired_at: REFRESH_TOKEN_COOKIE_OPTIONS.expires || new Date(),
      device_id: deviceInfo.deviceId,
      device_name: deviceInfo.deviceName,
    });

    const accessTokenPayload: AccessTokenJwtPayload = {
      sub: user.id,
      sessionId: session.id,
    };

    const refreshTokenPayload: RefreshTokenJwtPayload = {
      sub: user.id,
      sessionId: session.id,
    };

    return {
      access_token: this.jwtService.sign(accessTokenPayload, {
        expiresIn: 60 * 10, // TODO: Get from Redis config
      }),
      refresh_token: this.jwtService.sign(refreshTokenPayload, {
        expiresIn: 60 * 60 * 24 * 7, // TODO: Get from Redis config
      }),
    };
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

  setAuthCookie(res: Response, data: NewJwtTokenResponse) {
    res.cookie(
      authCookieName.ACCESS_TOKEN,
      data.access_token,
      ACCESS_TOKEN_COOKIE_OPTIONS
    );

    res.cookie(
      authCookieName.REFRESH_TOKEN,
      data.refresh_token,
      REFRESH_TOKEN_COOKIE_OPTIONS
    );
  }

  clearAuthCookie(res: Response) {
    res.cookie(authCookieName.ACCESS_TOKEN, '', {
      ...ACCESS_TOKEN_COOKIE_OPTIONS,
      maxAge: 0,
      expires: new Date(Date.now()),
    });
    res.cookie(authCookieName.REFRESH_TOKEN, '', {
      ...REFRESH_TOKEN_COOKIE_OPTIONS,
      maxAge: 0,
      expires: new Date(Date.now()),
    });
  }
}
