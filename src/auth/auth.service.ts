import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { LoginDto } from './dto/login.dto';

import { UsersService } from '../users/users.service';

import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async me(userId: string) {
    return this.usersService.findMe(userId);
  }
}
