import { PassportStrategy } from '@nestjs/passport';
import { IStrategyOptions, Strategy } from 'passport-local';
import { Injectable } from '@nestjs/common';

import { AuthService } from './auth.service';
import { IncorrectUserCredentialsException } from '@/auth/exceptions/incorrect-user-credentials.exception';

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
      throw new IncorrectUserCredentialsException();
    }

    return user;
  }
}
