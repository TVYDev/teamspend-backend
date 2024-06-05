import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'RSA Encrypted password',
  })
  @IsNotEmpty()
  new_password: string;
}
