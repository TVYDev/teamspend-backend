import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
      const statusCode = res.statusCode;
      if ([400, 401, 404, 403].includes(statusCode)) {
        this.logger.error(`[${req.method}] ${req.url} - ${statusCode}`);
      }
    });

    next();
  }
}
