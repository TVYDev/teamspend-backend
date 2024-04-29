import { PassportStrategy } from '@nestjs/passport';
import { IStrategyOptions, Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { ExceptionCause } from '@/interfaces/exception.interface';
import { exceptionErrorCode } from '../constants/exception';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    } as IStrategyOptions);
  }

  async validate(username: string, password: string) {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('User credentials are incorrect', {
        cause: {
          errorCode: exceptionErrorCode.INCORRECT_USER_CREDENTIALS,
        } as ExceptionCause,
      });
    }

    return user;
  }
}
