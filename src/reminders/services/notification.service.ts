import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async hasSentToday(params: {
    petId: string;
    referenceId: string;
    type: string;
    start: Date;
    end: Date;
  }): Promise<boolean> {
    const notification = await this.prisma.notification.findFirst({
      where: {
        petId: params.petId,
        referenceId: params.referenceId,
        type: params.type,
        status: 'SENT',
        scheduledFor: {
          gte: params.start,
          lte: params.end,
        },
      },
    });

    return Boolean(notification);
  }

  async hasSentAroundMinute(params: {
    petId: string;
    referenceId: string;
    type: string;
    scheduledFor: Date;
  }): Promise<boolean> {
    const notification = await this.prisma.notification.findFirst({
      where: {
        petId: params.petId,
        referenceId: params.referenceId,
        type: params.type,
        status: 'SENT',
        scheduledFor: {
          gte: new Date(params.scheduledFor.getTime() - 60_000),
          lte: new Date(params.scheduledFor.getTime() + 60_000),
        },
      },
    });

    return Boolean(notification);
  }

  async registerSent(data: {
    petId: string;
    referenceId: string;
    type: string;
    emailTo: string;
    scheduledFor: Date;
    message: string;
  }) {
    return this.prisma.notification.create({
      data: {
        petId: data.petId,
        referenceId: data.referenceId,
        type: data.type,
        emailTo: data.emailTo,
        scheduledFor: data.scheduledFor,
        sentAt: new Date(),
        status: 'SENT',
        message: data.message,
      },
    });
  }

  async registerFailed(data: {
    petId: string;
    referenceId: string;
    type: string;
    emailTo: string;
    scheduledFor: Date;
    message: string;
  }) {
    return this.prisma.notification.create({
      data: {
        petId: data.petId,
        referenceId: data.referenceId,
        type: data.type,
        emailTo: data.emailTo,
        scheduledFor: data.scheduledFor,
        status: 'FAILED',
        message: data.message,
      },
    });
  }
}
