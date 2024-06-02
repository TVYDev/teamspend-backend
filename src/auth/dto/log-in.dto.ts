import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogInDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'RSA Encrypted password',
  })
  @IsNotEmpty()
  password: string;
}
