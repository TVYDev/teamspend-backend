import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { TokenType, User } from '@prisma/client';

@Injectable()
export class TokensService {
  constructor(private prismaService: PrismaService) {}

  async createRefreshToken(user: User) {
    return this.prismaService.token.create({
      data: {
        subject_id: user.id,
        type: TokenType.REFRESH_TOKEN,
      },
    });
  }
}
