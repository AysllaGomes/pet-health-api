import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { QueryNotificationsDto } from './dto/query-notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: QueryNotificationsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      pet: {
        userId,
      },
      ...(query.status && { status: query.status }),
      ...(query.type && { type: query.type }),
      ...(query.petId && { petId: query.petId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
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
        skip,
        take: limit,
      }),
      this.prisma.notification.count({
        where,
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
