import { Injectable } from '@nestjs/common';

import { User } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findOne(email: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: { email },
    });
  }

  async create(data: CreateUserDto): Promise<User> {
    return this.prismaService.user.create({ data });
  }
}
