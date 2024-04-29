import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  Catch,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { StandardResponse } from './response-transform.interceptor';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const _request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // TODO: utilize log
    console.log('E', exception.getResponse());

    /**
     * TODO: Dynamic code and trace_id
     */
    response.status(status).json({
      code: 'E_001',
      message: exception.message,
      data: null,
      timestamp: new Date().getTime(),
      trace_id: 'TRACE_ID',
    } satisfies StandardResponse<null>);
  }
}
