import { UnauthorizedException } from '@nestjs/common';

import { exceptionErrorCode } from '@/constants/exception';
import { ExceptionCause } from '@/interfaces/exception.interface';

export class IncorrectUserCredentialsException extends UnauthorizedException {
  constructor() {
    super('User credentials are incorrect', {
      cause: {
        errorCode: exceptionErrorCode.INCORRECT_USER_CREDENTIALS,
      } as ExceptionCause,
    });
  }
}
