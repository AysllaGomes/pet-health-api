import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

type ReminderKind = 'DEFAULT' | 'BUY' | 'APPLY';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleVaccineReminders(): Promise<void> {
    this.logger.log('Verificando vacinas próximas...');

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const dayStart = new Date(today);
    const dayEnd = new Date(today);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const vaccines = await this.prisma.vaccine.findMany({
      where: {
        nextDoseDate: {
          not: null,
        },
      },
      include: {
        pet: {
          include: {
            user: true,
          },
        },
      },
    });

    this.logger.log(`Vacinas encontradas: ${vaccines.length}`);

    for (const vaccine of vaccines) {
      if (!vaccine.nextDoseDate) {
        continue;
      }

      const reminderPlans = this.buildReminderPlans(
        vaccine.name,
        vaccine.nextDoseDate,
        vaccine.reminderDaysBefore ?? 7,
      );

      for (const plan of reminderPlans) {
        this.logger.log(
          `Vacina=${vaccine.name} | tipo=${plan.kind} | scheduledDate=${plan.date.toISOString()} | today=${today.toISOString()}`,
        );

        if (plan.date.getTime() !== today.getTime()) {
          continue;
        }

        const alreadySent = await this.prisma.notification.findFirst({
          where: {
            petId: vaccine.petId,
            referenceId: vaccine.id,
            type: `VACCINE_${plan.kind}`,
            status: 'SENT',
            scheduledFor: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        });

        if (alreadySent) {
          this.logger.log(
            `Notificação já enviada para vacina ${vaccine.name} (${plan.kind})`,
          );
          continue;
        }

        try {
          await this.mailService.sendVaccineReminder({
            to: vaccine.pet.user.email,
            tutorName: vaccine.pet.user.name,
            petName: vaccine.pet.name,
            vaccineName: vaccine.name,
            nextDoseDate: vaccine.nextDoseDate,
            reminderKind: plan.kind,
          });

          await this.prisma.notification.create({
            data: {
              petId: vaccine.petId,
              type: `VACCINE_${plan.kind}`,
              referenceId: vaccine.id,
              emailTo: vaccine.pet.user.email,
              scheduledFor: plan.date,
              sentAt: new Date(),
              status: 'SENT',
              message: `Lembrete ${plan.kind} enviado para ${vaccine.name}`,
            },
          });

          this.logger.log(
            `Lembrete ${plan.kind} enviado para ${vaccine.pet.user.email} sobre ${vaccine.name} de ${vaccine.pet.name}`,
          );
        } catch (error) {
          await this.prisma.notification.create({
            data: {
              petId: vaccine.petId,
              type: `VACCINE_${plan.kind}`,
              referenceId: vaccine.id,
              emailTo: vaccine.pet.user.email,
              scheduledFor: plan.date,
              status: 'FAILED',
              message:
                error instanceof Error ? error.message : 'Erro desconhecido',
            },
          });

          this.logger.error(
            `Erro ao enviar lembrete para ${vaccine.pet.user.email}`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }
    }
  }

  private buildReminderPlans(
    vaccineName: string,
    nextDoseDate: Date,
    reminderDaysBefore: number,
  ): Array<{ kind: ReminderKind; date: Date }> {
    const normalizedName = this.normalizeText(vaccineName);
    const isSpecialType =
      normalizedName.includes('antipulga') ||
      normalizedName.includes('antipulgas') ||
      normalizedName.includes('vermifugo') ||
      normalizedName.includes('vermifugos');

    if (isSpecialType) {
      const buyDate = new Date(nextDoseDate);
      buyDate.setUTCDate(buyDate.getUTCDate() - 5);
      buyDate.setUTCHours(0, 0, 0, 0);

      const applyDate = new Date(nextDoseDate);
      applyDate.setUTCHours(0, 0, 0, 0);

      return [
        { kind: 'BUY', date: buyDate },
        { kind: 'APPLY', date: applyDate },
      ];
    }

    const defaultReminderDate = new Date(nextDoseDate);
    defaultReminderDate.setUTCDate(
      defaultReminderDate.getUTCDate() - reminderDaysBefore,
    );
    defaultReminderDate.setUTCHours(0, 0, 0, 0);

    return [{ kind: 'DEFAULT', date: defaultReminderDate }];
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
