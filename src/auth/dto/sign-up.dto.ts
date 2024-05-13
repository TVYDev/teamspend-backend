import { IsEmail, IsNotEmpty } from 'class-validator';

import { IsUserAlreadyExist } from '@/users/decorators/is-user-already-exist.decorator';

export class SignUpDto {
  @IsEmail()
  @IsUserAlreadyExist()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  first_name: string;

  middle_name?: string;

  @IsNotEmpty()
  last_name: string;
}
