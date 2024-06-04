import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { Status, User } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findActiveUserById(id: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: { id, status: Status.ACTIVE },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: { email },
    });
  }

  async findActiveUserByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: { email, status: Status.ACTIVE },
    });
  }

  async createUser(data: CreateUserDto): Promise<User> {
    return this.prismaService.user.create({ data });
  }

  async generateUsername() {
    const { nanoid } = await (eval(`import('nanoid')`) as Promise<
      typeof import('nanoid')
    >);
    return `user_${nanoid(10)}`;
  }

  async changePassword(user: User, newPassword: string) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    return this.prismaService.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
  }
}
