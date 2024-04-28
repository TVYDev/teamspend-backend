export class CreateUserDto {
  username: string;
  email: string;
  password: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
}
