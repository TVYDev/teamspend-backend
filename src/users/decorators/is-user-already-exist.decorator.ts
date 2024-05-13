import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

import { UsersService } from '@/users/users.service';

export const IS_USER_ALREADY_EXIST_CONSTRAINT_NAME = 'IsUserAlreadyExist';

@ValidatorConstraint({
  async: true,
  name: IS_USER_ALREADY_EXIST_CONSTRAINT_NAME,
})
@Injectable()
export class IsUserAlreadyExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private usersService: UsersService) {}

  async validate(email: string) {
    const user = await this.usersService.findUserByEmail(email);
    return !user;
  }

  defaultMessage(_args: ValidationArguments) {
    return 'Email ($value) is already in used.';
  }
}

export function IsUserAlreadyExist(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUserAlreadyExistConstraint,
    });
  };
}
