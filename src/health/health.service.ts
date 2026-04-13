import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { HealthcheckResponse } from './interfaces/healthcheck-response.interface';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthcheckResponse> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        database: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'error',
        database: 'down',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
