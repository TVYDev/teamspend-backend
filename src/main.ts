import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';

import { AppModule } from './app.module';
import { logger } from './logger.middleware';
import { ExceptionCause } from './interfaces/exception.interface';
import { exceptionErrorCode } from './constants/exception';
import { IS_USER_ALREADY_EXIST_CONSTRAINT_NAME } from './users/decorators/is-user-already-exist.decorator';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(logger);
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

        throw new BadRequestException(validationErrorMessage, {
          cause: {
            errorCode: exceptionErrorCode.VALIDATION_ERROR,
          } as ExceptionCause,
        });
      },
    })
  );

  /**
   * To allow custome decorators inject services into it
   */
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // TODO: CORS
  // app.enableCors({
  //   // read more options here: https://github.com/expressjs/cors#configuration-options
  //   origin: '',
  //   credentials: true,
  // });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port, () => {
    console.log(`Application is running on port ${port}`);
  });
}
bootstrap();
