import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

import { ForbiddenResourceException } from '@/lib/exceptions/forbidden-resource.exception';
import { authCookieName } from './constants';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const cookies = request.cookies;

    if (!(authCookieName.REFRESH_TOKEN in cookies)) {
      throw new ForbiddenResourceException();
    }

    const refreshTokenJwt = cookies[authCookieName.REFRESH_TOKEN];

    try {
      return await this.jwtService.verifyAsync(refreshTokenJwt);
    } catch {
      throw new ForbiddenResourceException();
    }
  }
}
