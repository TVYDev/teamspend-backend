import { ForbiddenException } from '@nestjs/common';

import { exceptionErrorCode } from '@/lib/constants/exception';
import { ExceptionCause } from '@/lib/interfaces/exception.interface';

export class ForbiddenResourceException extends ForbiddenException {
  constructor() {
    super('Forbidden', {
      cause: {
        errorCode: exceptionErrorCode.FORBIDDEN_ERROR,
      } as ExceptionCause,
    });
  }
}
