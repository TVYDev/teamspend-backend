import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';

import { TokenExpiredException } from '@/lib/exceptions/token-expired.exception';
import { IS_PUBLIC } from './auth.decorator';
import { accessTokenJwtFromCookieOrAuthHeader } from './jwt.strategy';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService
  ) {
    super();
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    /**
     * Case JWT access_token expires, we have specific exception to be thrown
     */
    const request = context.switchToHttp().getRequest<Request>();
    const accessTokenJwt = accessTokenJwtFromCookieOrAuthHeader(request);

    try {
      this.jwtService.verify(accessTokenJwt);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new TokenExpiredException();
      }
    }

    return super.canActivate(context);
  }
}
