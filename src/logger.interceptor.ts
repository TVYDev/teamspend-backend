import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('INTERCEPTOR Before....');

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`INTERCEPTOR After... ${Date.now() - now}ms`))
      );
  }
}
