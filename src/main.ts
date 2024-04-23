import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { logger } from './logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(logger);

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
