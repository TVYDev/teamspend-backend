import { UnauthorizedException } from '@nestjs/common';

import { exceptionErrorCode } from '@/lib/constants/exception';
import { ExceptionCause } from '@/lib/interfaces/exception.interface';

export class TokenExpiredException extends UnauthorizedException {
  constructor() {
    super('Token is expired', {
      cause: {
        errorCode: exceptionErrorCode.EXPIRED_TOKEN,
      } as ExceptionCause,
    });
  }
}
