import { BadRequestException } from '@nestjs/common';

import { exceptionErrorCode } from '@/lib/constants/exception';
import { ExceptionCause } from '@/lib/interfaces/exception.interface';

export class NotFoundResourceException extends BadRequestException {
  constructor() {
    super('Bad Request', {
      cause: {
        errorCode: exceptionErrorCode.NOT_FOUND_RESOURCE,
      } as ExceptionCause,
    });
  }
}
