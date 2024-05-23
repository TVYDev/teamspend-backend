import { BadRequestException } from '@nestjs/common';

import { exceptionErrorCode } from '@/lib/constants/exception';
import { ExceptionCause } from '@/lib/interfaces/exception.interface';

export class RestrictedSelfSessionRevocationException extends BadRequestException {
  constructor() {
    super('It is restricted to revoke your own session', {
      cause: {
        errorCode: exceptionErrorCode.AUTH.RESTRICTECD_SELF_SESSION_REVOCATION,
      } as ExceptionCause,
    });
  }
}
