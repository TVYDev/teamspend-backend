import { BadRequestException } from '@nestjs/common';

import { exceptionErrorCode } from '@/constants/exception';
import { ExceptionCause } from '@/interfaces/exception.interface';

export class InvalidRequestPayloadException extends BadRequestException {
  constructor(message?: string) {
    super(message || 'Bad request', {
      cause: {
        errorCode: exceptionErrorCode.VALIDATION_ERROR,
      } as ExceptionCause,
    });
  }
}
