import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { UsersService } from './users.service';
import { IsUserAlreadyExistConstraint } from './decorators/is-user-already-exist.decorator';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, IsUserAlreadyExistConstraint],
  exports: [UsersService],
})
export class UsersModule {}
