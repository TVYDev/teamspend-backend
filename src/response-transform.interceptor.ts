import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  intercept(
    _context: ExecutionContext,
    next: CallHandler
  ): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        code: 'S_001',
        message: 'Success',
        data,
        trace_id: 'TRACE_ID',
        timestamp: new Date().getTime(),
      }))
    );
  }
}
