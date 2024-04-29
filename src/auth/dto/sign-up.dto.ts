import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  first_name: string;

  middle_name?: string;

  @IsNotEmpty()
  last_name: string;
}
