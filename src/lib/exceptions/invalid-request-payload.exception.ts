import { BadRequestException } from '@nestjs/common';

import { exceptionErrorCode } from '@/lib/constants/exception';
import { ExceptionCause } from '@/lib/interfaces/exception.interface';

export class InvalidRequestPayloadException extends BadRequestException {
  constructor(message?: string) {
    super(message || 'Bad request', {
      cause: {
        errorCode: exceptionErrorCode.VALIDATION_ERROR,
      } as ExceptionCause,
    });
  }
}
