// TODO: apply request validation
export class SignUpDto {
  email: string;
  password: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
}
