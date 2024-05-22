import { Injectable } from '@nestjs/common';

import { Session, SessionType, Status } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(private prismaService: PrismaService) {}

  createSession({ user_id, ...data }: CreateSessionDto): Promise<Session> {
    return this.prismaService.session.create({
      data: {
        ...data,
        user__id: user_id,
      },
    });
  }

  findActiveSessionByIdAndType(
    id: string,
    type: SessionType
  ): Promise<Session | null> {
    return this.prismaService.session.findFirst({
      where: {
        id,
        type,
        status: Status.ACTIVE,
        expired_at: { gte: new Date() },
      },
    });
  }

  revokeSessionById(id: string): Promise<Session> {
    return this.prismaService.session.update({
      where: { id },
      data: { status: Status.INACTIVE },
    });
  }
}
