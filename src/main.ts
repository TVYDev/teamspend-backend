import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { WinstonModule } from 'nest-winston';
import { transports, format } from 'winston';
import { ecsFormat } from '@elastic/ecs-winston-format';
import 'winston-daily-rotate-file';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { IS_USER_ALREADY_EXIST_CONSTRAINT_NAME } from './users/decorators/is-user-already-exist.decorator';
import { InvalidRequestPayloadException } from './lib/exceptions/invalid-request-payload.exception';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new transports.DailyRotateFile({
          filename: 'logs/%DATE%-error.log',
          level: 'error',
          format: ecsFormat(),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxFiles: '30d',
        }),
        new transports.DailyRotateFile({
          filename: 'logs/%DATE%-combined.log',
          format: ecsFormat(),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxFiles: '30d',
        }),
        new transports.Console({
          format: format.combine(
            format.cli(),
            format.splat(),
            format.timestamp(),
            format.printf(
              (info) => `${info.timestamp} ${info.level}: ${info.message}`
            )
          ),
        }),
      ],
    }),
  });

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        let validationErrorMessage = 'Bad request';
        if (errors.length > 0 && errors[0].constraints) {
          if (IS_USER_ALREADY_EXIST_CONSTRAINT_NAME in errors[0].constraints) {
            validationErrorMessage =
              errors[0].constraints[IS_USER_ALREADY_EXIST_CONSTRAINT_NAME];
          }
        }

        // TODO: to add validation errors into log
        console.log('Validation Errors', errors);

        throw new InvalidRequestPayloadException(validationErrorMessage);
      },
    })
  );

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // TODO: CORS
  // app.enableCors({
  //   // read more options here: https://github.com/expressjs/cors#configuration-options
  //   origin: '',
  //   credentials: true,
  // });

  /**
   * To allow custom decorators inject services into it
   */
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('TeamSpend API')
    .setDescription('REST API for TeamSpend')
    .setVersion('v1')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port, () => {
    console.log(`Application is running on port ${port}`);
  });
}
bootstrap();
