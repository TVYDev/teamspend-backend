import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { Public } from './auth/auth.decorator';

@Public()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }

  @Get('/timeout')
  async getHelloTimeout(): Promise<string> {
    /** TESTING Timeout response */
    return new Promise((resolve, _reject) => {
      setTimeout(() => {
        resolve(this.appService.getHello());
      }, 5000);
    });
  }
}
