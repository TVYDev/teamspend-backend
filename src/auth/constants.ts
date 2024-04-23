export const authCookieName = {
  accessToken: 'access_token',
} as const;

export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'secretKey',
  ttl: process.env.JWT_TTL || '60s',
};
