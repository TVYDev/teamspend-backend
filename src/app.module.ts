import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './http-exception.filter';
import { LoggingInterceptor } from './lib/interceptors/logger.interceptor';
import { ResponseTransformInterceptor } from './lib/interceptors/response-transform.interceptor';
import { TimeoutInterceptor } from './lib/interceptors/timeout.interceptor';
import { SessionsModule } from './sessions/sessions.module';
import { HttpHeaderGuard } from './http-headers.guard';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      expandVariables: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('sit', 'uat', 'production', 'test')
          .default('sit'),
        PORT: Joi.number().port().default(3000),
      }),
      validationOptions: {
        abortEarly: true,
        allowUnknown: true,
        convert: true,
        presence: 'required',
      },
    }),
    AuthModule,
    SessionsModule,
  ],
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
    {
      provide: 'APP_INTERCEPTOR',
      useClass: TimeoutInterceptor,
    },
    {
      provide: 'APP_GUARD',
      useClass: HttpHeaderGuard,
    },
  ],
})
export class AppModule {}
