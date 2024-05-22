import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { requiredCustomHeader } from '@/lib/constants/request';
import { ForbiddenResourceException } from '@/lib/exceptions/forbidden-resource.exception';

@Injectable()
export class HttpHeaderGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const headers = request.headers;

    // TODO: check if device_id matched session_id

    if (
      !requiredCustomHeader.every(
        (header) => header in headers && headers[header] !== ''
      )
    ) {
      //TODO: add logging
      throw new ForbiddenResourceException();
    }

    return true;
  }
}
