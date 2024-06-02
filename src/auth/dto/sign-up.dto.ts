import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsUserAlreadyExist } from '@/users/decorators/is-user-already-exist.decorator';

export class SignUpDto {
  @ApiProperty()
  @IsEmail()
  @IsUserAlreadyExist()
  email: string;

  @ApiProperty({
    description: 'RSA Encrypted password',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  first_name: string;

  @ApiPropertyOptional()
  middle_name?: string;

  @ApiProperty()
  @IsNotEmpty()
  last_name: string;
}
