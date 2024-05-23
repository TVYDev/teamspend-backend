import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  Catch,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { StandardResponse } from './lib/interceptors/response-transform.interceptor';
import { ExceptionCause } from './lib/interfaces/exception.interface';
import { exceptionErrorCode } from './lib/constants/exception';
import { UnauthorizedAccessException } from './auth/exceptions/unauthorized-access.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const _request = ctx.getRequest<Request>();

    // TODO: utilize log
    console.log('E', exception.getResponse());

    if (exception instanceof UnauthorizedException && !exception.cause) {
      exception = new UnauthorizedAccessException();
    }

    const exceptionCause = exception.cause as ExceptionCause | undefined;
    const status = exception.getStatus();
    const message = exception.message;

    const errorCode =
      exceptionCause?.errorCode || exceptionErrorCode.GENERAL_ERROR;

    /**
     * TODO: Dynamic code and trace_id
     */
    response.status(status).json({
      code: errorCode,
      message: message,
      data: null,
      timestamp: new Date().getTime(),
      trace_id: 'TRACE_ID',
    } satisfies StandardResponse<null>);
  }
}
