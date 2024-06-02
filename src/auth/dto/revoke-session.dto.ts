import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RevokeSessionDto {
  @ApiProperty({ description: 'The id of the session to revoke' })
  @IsNotEmpty()
  id: string;
}
