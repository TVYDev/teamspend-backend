import { AccessTokenJwtPayload } from './access-token-jwt-payload.interface';

export interface AuthenticatedRequest extends Request {
  user: AccessTokenJwtPayload;
}
