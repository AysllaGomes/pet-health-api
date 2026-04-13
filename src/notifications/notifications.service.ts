import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { QueryNotificationsDto } from './dto/query-notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: QueryNotificationsDto) {
    const where = {
      pet: {
        userId,
      },
      ...(query.status && { status: query.status }),
      ...(query.type && { type: query.type }),
      ...(query.petId && { petId: query.petId }),
    };

    return this.prisma.notification.findMany({
      where,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        scheduledFor: 'desc',
      },
    });
  }
}
