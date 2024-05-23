import { Injectable } from '@nestjs/common';

import { Session, SessionType, Status, User } from '@prisma/client';
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
      orderBy: { created_at: 'desc' },
    });
  }

  findActiveSessionsOfUser(user: User): Promise<Session[]> {
    return this.prismaService.session.findMany({
      where: {
        user__id: user.id,
        status: Status.ACTIVE,
        expired_at: { gte: new Date() },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  countActiveSessionsOfUser(user: User): Promise<number> {
    return this.prismaService.session.count({
      where: {
        user__id: user.id,
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

  revokeSessionByIdAndUser(id: string, user: User): Promise<Session> {
    return this.prismaService.session.update({
      where: { id, user__id: user.id },
      data: { status: Status.INACTIVE },
    });
  }

  async revokeEarlierActiveSessionsOfUser(user: User, count: number) {
    const earlierActiveSessions = await this.prismaService.session.findMany({
      where: {
        user__id: user.id,
        status: Status.ACTIVE,
        expired_at: { gte: new Date() },
      },
      orderBy: { created_at: 'asc' },
      take: count,
    });

    await this.prismaService.session.updateMany({
      where: {
        id: { in: earlierActiveSessions.map((session) => session.id) },
      },
      data: { status: Status.INACTIVE },
    });
  }
}
