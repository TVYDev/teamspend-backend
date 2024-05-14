import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, WithSecretOrKey } from 'passport-jwt';
import { Request } from 'express';

import { UsersService } from '@/users/users.service';
import { authCookieName, jwtConstants } from './constants';
import { AccessTokenJwtPayload } from './auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: accessTokenJwtFromCookieOrAuthHeader,
      /** Set value "false" to delegate the responsibility of ensuring that a JWT has not expired to the Passport module. */
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    } as WithSecretOrKey);
  }

  /** We're guaranteed that here we're receiving payload of a valid token after JWT's signature verification in super() */
  async validate(payload: AccessTokenJwtPayload) {
    // TODO: there could be a better approach to check against user session from redis, maybe faster than going to db every time
    const user = await this.usersService.findActiveUserById(payload.sub);
    if (!user) {
      return false;
    }

    // TODO: could do token revocation here
    return user;
  }
}

const accessTokenJwtFromCookieOrAuthHeader = (req: Request) => {
  let accessTokenJwt = null;

  if (req && req.cookies) {
    accessTokenJwt = req.cookies[authCookieName.accessToken];
  }

  return accessTokenJwt || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};
