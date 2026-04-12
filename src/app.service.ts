import { Injectable } from '@nestjs/common';

import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHello(): Promise<string> {
    const totalUsers = await this.prisma.user.count();
    return `API online com Prisma. Total de usuários: ${totalUsers}`;
  }
}
