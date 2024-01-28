import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './http-exception.filter';
import { LoggingInterceptor } from './logger.interceptor';
import { ResponseTransformInterceptor } from './response-transform.interceptor';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_FILTER',
      useClass: HttpExceptionFilter,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: LoggingInterceptor,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ResponseTransformInterceptor,
    },
  ],
})
export class AppModule {}
