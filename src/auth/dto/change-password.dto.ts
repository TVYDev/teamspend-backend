import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'RSA Encrypted password',
  })
  @IsNotEmpty()
  old_password: string;

  @ApiProperty({
    description: 'RSA Encrypted password',
  })
  @IsNotEmpty()
  new_password: string;
}
