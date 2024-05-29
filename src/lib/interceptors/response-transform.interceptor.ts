import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

export interface StandardResponse<T> {
  code: string;
  message: string;
  data: T;
  trace_id: string;
  timestamp: number;
}

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  private readonly logger = new Logger(ResponseTransformInterceptor.name);

  intercept(
    _context: ExecutionContext,
    next: CallHandler
  ): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const standardSuccessResponse: StandardResponse<T> = {
          code: 'S_001',
          message: 'Success',
          data: data || null,
          trace_id: uuidv4().replaceAll('-', ''),
          timestamp: new Date().getTime(),
        };

        this.logger.log(standardSuccessResponse);

        return standardSuccessResponse;
      })
    );
  }
}
