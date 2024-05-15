import { UnauthorizedException } from '@nestjs/common';

import { exceptionErrorCode } from '@/lib/constants/exception';
import { ExceptionCause } from '@/lib/interfaces/exception.interface';

export class IncorrectUserCredentialsException extends UnauthorizedException {
  constructor() {
    super('User credentials are incorrect', {
      cause: {
        errorCode: exceptionErrorCode.INCORRECT_USER_CREDENTIALS,
      } as ExceptionCause,
    });
  }
}
