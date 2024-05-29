import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

import { requiredCustomHeader } from '@/lib/constants/request';
import { UnauthorizedAccessException } from '@/auth/exceptions/unauthorized-access.exception';

@Injectable()
export class HttpHeaderGuard implements CanActivate {
  private readonly logger = new Logger(HttpHeaderGuard.name);

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const headers = request.headers;

    if (
      !requiredCustomHeader.every(
        (header) => header in headers && headers[header] !== ''
      )
    ) {
      this.logger.error('Missing required header');
      throw new UnauthorizedAccessException();
    }

    return true;
  }
}
