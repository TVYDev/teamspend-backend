import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  Catch,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { StandardResponse } from './lib/interceptors/response-transform.interceptor';
import { ExceptionCause } from './lib/interfaces/exception.interface';
import { exceptionErrorCode } from './lib/constants/exception';
import { UnauthorizedAccessException } from './auth/exceptions/unauthorized-access.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const _request = ctx.getRequest<Request>();

    const traceId = uuidv4().replaceAll('-', '');

    if (exception instanceof UnauthorizedException && !exception.cause) {
      exception = new UnauthorizedAccessException();
    }

    const exceptionCause = exception.cause as ExceptionCause | undefined;
    const status = exception.getStatus();
    const message = exception.message;

    const errorCode =
      exceptionCause?.errorCode || exceptionErrorCode.GENERAL_ERROR;

    const standartErrorResponse: StandardResponse<null> = {
      code: errorCode,
      message: message,
      data: null,
      timestamp: new Date().getTime(),
      /**
       * TODO: trace_id is not fully traceable for a complete request
       */
      trace_id: traceId,
    };

    this.logger.error(standartErrorResponse, exception.stack);

    response.status(status).json(standartErrorResponse);
  }
}
