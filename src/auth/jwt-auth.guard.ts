import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';

import { SessionType } from '@prisma/client';
import { SessionsService } from '@/sessions/sessions.service';
import { TokenExpiredException } from '@/auth/exceptions/token-expired.exception';
import { getDeviceInfoFromHeaders } from '@/lib/helpers/request';
import { UnauthorizedAccessException } from './exceptions/unauthorized-access.exception';
import { IS_PUBLIC } from './auth.decorator';
import { accessTokenJwtFromCookieOrAuthHeader } from './jwt.strategy';
import { AccessTokenJwtPayload } from './auth.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private sessionsService: SessionsService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
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
      await this.jwtService.verifyAsync(accessTokenJwt);

      // TODO: use Redis for faster lookup
      const decodedAccessTokenJwt =
        this.jwtService.decode<AccessTokenJwtPayload>(accessTokenJwt);
      const deviceInfo = getDeviceInfoFromHeaders(request.headers);
      const session = await this.sessionsService.findActiveSessionByIdAndType(
        decodedAccessTokenJwt.sessionId,
        SessionType.LOGIN
      );

      if (deviceInfo.deviceId !== session?.device_id) {
        throw new UnauthorizedAccessException();
      }
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new TokenExpiredException();
      }
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
