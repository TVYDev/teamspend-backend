import { Controller, Get, Param } from '@nestjs/common';

import { User as UserModel } from '@prisma/client';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UsersService
  ) {}

  @Get()
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string): Promise<UserModel | null> {
    return this.usersService.findUser(Number(id));
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
