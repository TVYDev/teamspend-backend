import { UnauthorizedException } from '@nestjs/common';

import { exceptionErrorCode } from '@/lib/constants/exception';
import { ExceptionCause } from '@/lib/interfaces/exception.interface';

export class UnauthorizedAccessException extends UnauthorizedException {
  constructor() {
    super('Unauthorized Access', {
      cause: {
        errorCode: exceptionErrorCode.UNAUTHORIZED_ACCESS,
      } as ExceptionCause,
    });
  }
}
