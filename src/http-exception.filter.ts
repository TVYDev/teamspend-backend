import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  Catch,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { StandardResponse } from './lib/interceptors/response-transform.interceptor';
import { ExceptionCause } from './lib/interfaces/exception.interface';
import { exceptionErrorCode } from './lib/constants/exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const _request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionCause = exception.cause as ExceptionCause | undefined;

    // TODO: utilize log
    console.log('E', exception.getResponse());

    /**
     * TODO: Dynamic code and trace_id
     */
    response.status(status).json({
      code: exceptionCause?.errorCode || exceptionErrorCode.GENERAL_ERROR,
      message: exception.message,
      data: null,
      timestamp: new Date().getTime(),
      trace_id: 'TRACE_ID',
    } satisfies StandardResponse<null>);
  }
}
