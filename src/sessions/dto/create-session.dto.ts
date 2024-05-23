import { SessionType } from '@prisma/client';

export class CreateSessionDto {
  user_id: string;

  type: SessionType;

  device_id?: string;

  device_name?: string;

  expired_at: Date;
}
