import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Status, TokenType, User } from '@prisma/client';

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

  findActiveTokenByIdAndType(id: string, tokenType: TokenType) {
    return this.prismaService.token.findFirst({
      where: { id, status: Status.ACTIVE, type: tokenType },
    });
  }

  revokeTokenById(id: string) {
    return this.prismaService.token.update({
      where: { id },
      data: { status: Status.INACTIVE },
    });
  }
}
