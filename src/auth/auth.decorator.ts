import { SetMetadata } from '@nestjs/common';

export const IS_SKIP_AUTH = 'isSkipAuth';
export const SkipAuth = () => SetMetadata(IS_SKIP_AUTH, true);
