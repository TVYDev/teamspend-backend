import { Injectable } from '@nestjs/common';

import { User } from '@prisma/client';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findUser(id: number): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: { id },
    });
  }
}
