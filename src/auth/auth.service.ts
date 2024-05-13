import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

import { User } from '@prisma/client';
import { UsersService } from '@/users/users.service';
import { CryptoService } from '@/crypto/crypto.service';
import { ExceptionCause } from '@/interfaces/exception.interface';
import { exceptionErrorCode } from '@/constants/exception';
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
        //TODO: can put this exception to somewhere reusable?
        throw new UnauthorizedException('User credentials are incorrect', {
          cause: {
            errorCode: exceptionErrorCode.INCORRECT_USER_CREDENTIALS,
          } as ExceptionCause,
        });
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
      //TODO: can put this exception to somewhere reusable?
      throw new BadRequestException('Bad request', {
        cause: {
          errorCode: exceptionErrorCode.VALIDATION_ERROR,
        } as ExceptionCause,
      });
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
