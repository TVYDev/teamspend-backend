import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

import { jwtConstants } from './constants';
import { IS_SKIP_AUTH } from './auth.decorator';
import { AccessTokenJwtPayload } from './interfaces/access-token-jwt-payload.interface';
import { AuthenticatedRequest } from './interfaces/authenticated-request';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isSkipAuth = this.reflector.getAllAndOverride<boolean>(IS_SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isSkipAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenJwtPayload>(
        token,
        {
          secret: jwtConstants.secret,
        }
      );

      request.user = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader =
      'authorization' in request.headers ? request.headers.authorization : '';

    if (typeof authHeader !== 'string') {
      return undefined;
    }

    const [type, token] = authHeader.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
