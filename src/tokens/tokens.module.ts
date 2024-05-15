import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { TokensService } from './tokens.service';

@Module({
  providers: [TokensService],
  exports: [TokensService],
  imports: [PrismaModule],
})
export class TokensModule {}
