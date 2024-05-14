export const authCookieName = {
  accessToken: 'access_token',
  refresh_token: 'refresh_token',
} as const;

// TODO: To use Redis configuration
export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'secretKey',
  ttl: process.env.JWT_TTL || '60s',
};
