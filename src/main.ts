import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { logger } from './logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(logger);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false,
    })
  );

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
