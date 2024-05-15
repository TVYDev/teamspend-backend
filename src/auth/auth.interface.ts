export interface AccessTokenJwtPayload {
  sub: string;
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
  user: AccessTokenJwtPayload;
}
