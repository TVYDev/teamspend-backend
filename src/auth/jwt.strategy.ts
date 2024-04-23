import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, WithSecretOrKey } from 'passport-jwt';
import { Request } from 'express';

import { authCookieName, jwtConstants } from './constants';
import { AccessTokenJwtPayload } from './interfaces/access-token-jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: accessTokenJwtFromCookieOrAuthHeader,
      /** Set value "false" to delegate the responsibility of ensuring that a JWT has not expired to the Passport module. */
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    } as WithSecretOrKey);
  }

  /** We're guaranteed that here we're receiving payload of a valid token after JWT's signature verification in super() */
  async validate(payload: AccessTokenJwtPayload) {
    // TODO: do database look up to get user info or validate if user exists
    // TODO: could do token revocation here
    return { id: payload.sub, email: payload.email };
  }
}

const accessTokenJwtFromCookieOrAuthHeader = (req: Request) => {
  let accessTokenJwt = null;

  if (req && req.cookies) {
    accessTokenJwt = req.cookies[authCookieName.accessToken];
  }

  return accessTokenJwt || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};
