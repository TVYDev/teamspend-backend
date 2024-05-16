import { User } from '@prisma/client';
import { Request } from 'express';

export interface AccessTokenJwtPayload {
  sub: string;
  refreshTokenId: string;
}

export interface RefreshTokenJwtPayload {
  sub: string;
  tokenId: string;
}

export interface NewJwtTokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface AuthenticatedRequest extends Request {
  user: User;
}
