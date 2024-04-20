import { Module } from '@nestjs/common';

import { PrismaService } from '@/prisma.service';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService, PrismaService], //TODO: should not add PrismaService in this module
  exports: [UsersService],
})
export class UsersModule {}
