import { IsNotEmpty } from 'class-validator';

export class RevokeSessionDto {
  @IsNotEmpty()
  id: string;
}
