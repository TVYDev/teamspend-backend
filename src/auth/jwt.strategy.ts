import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, WithSecretOrKey } from 'passport-jwt';

import { jwtConstants } from './constants';
import { AccessTokenJwtPayload } from './interfaces/access-token-jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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
