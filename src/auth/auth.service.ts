import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '@/users/users.service';
import { AccessTokenJwtPayload } from './interfaces/access-token-jwt-payload.interface';
import { User } from '@prisma/client';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, _password: string) {
    const user = await this.usersService.findOne(email);
    if (user) {
      // TODO: Not to return password
      return user;
    }

    return null;
  }

  async login(user: User) {
    const payload: AccessTokenJwtPayload = {
      email: user.email,
      sub: user.id,
    };

    return { access_token: this.jwtService.sign(payload) };
  }

  async signUp(signUpDto: SignUpDto) {
    /**
     * TODO: user password with RSA
     */
    const username = `user_${Date.now()}`;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(signUpDto.password, salt);

    return this.usersService.create({
      ...signUpDto,
      password: hashedPassword,
      username,
    });
  }
}
