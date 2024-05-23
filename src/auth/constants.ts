export const authCookieName = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

// TODO: To use Redis configuration
export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'secretKey',
  ttl: process.env.JWT_TTL || '60s',
};

// TODO: To use Redis configuration
export const sessionConstants = {
  allowedNumberOfSessions: 1,
};
