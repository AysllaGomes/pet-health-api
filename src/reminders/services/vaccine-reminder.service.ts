import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';

import { ReminderDateService } from './reminder-date.service';
import { NotificationService } from './notification.service';

import { ReminderType, VaccineReminderContext } from '../types/reminder.types';

@Injectable()
export class VaccineReminderService {
  private readonly logger = new Logger(VaccineReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly reminderDateService: ReminderDateService,
    private readonly notificationService: NotificationService,
  ) {}

  async process(): Promise<void> {
    this.logger.log('Verificando vacinas próximas...');

    const now = new Date();
    const today = new Date(now);
    today.setUTCHours(0, 0, 0, 0);

    const dayRange = this.reminderDateService.getUtcDayRange(now);

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
      if (!vaccine.nextDoseDate) continue;

      const reminderPlans = this.reminderDateService.buildVaccineReminderPlans(
        vaccine.category,
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

        const type = this.getNotificationType(plan.kind);

        const alreadySent = await this.notificationService.hasSentToday({
          petId: vaccine.petId,
          referenceId: vaccine.id,
          type,
          start: dayRange.start,
          end: dayRange.end,
        });

        if (alreadySent) {
          this.logger.log(
            `Notificação já enviada para vacina ${vaccine.name} (${plan.kind})`,
          );
          continue;
        }

        const context: VaccineReminderContext = {
          petId: vaccine.petId,
          vaccineId: vaccine.id,
          emailTo: vaccine.pet.user.email,
          tutorName: vaccine.pet.user.name,
          petName: vaccine.pet.name,
          vaccineName: vaccine.name,
          nextDoseDate: vaccine.nextDoseDate,
          kind: plan.kind,
          scheduledFor: plan.date,
        };

        await this.sendReminder(context);
      }
    }
  }

  private async sendReminder(context: VaccineReminderContext): Promise<void> {
    const type = this.getNotificationType(context.kind);

    try {
      await this.mailService.sendVaccineReminder({
        to: context.emailTo,
        tutorName: context.tutorName,
        petName: context.petName,
        vaccineName: context.vaccineName,
        nextDoseDate: context.nextDoseDate,
        reminderKind: context.kind,
      });

      await this.notificationService.registerSent({
        petId: context.petId,
        referenceId: context.vaccineId,
        type,
        emailTo: context.emailTo,
        scheduledFor: context.scheduledFor,
        message: `Lembrete ${context.kind} enviado para ${context.vaccineName}`,
      });

      this.logger.log(
        `Lembrete ${context.kind} enviado para ${context.emailTo} sobre ${context.vaccineName} de ${context.petName}`,
      );
    } catch (error) {
      await this.notificationService.registerFailed({
        petId: context.petId,
        referenceId: context.vaccineId,
        type,
        emailTo: context.emailTo,
        scheduledFor: context.scheduledFor,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });

      this.logger.error(
        `Erro ao enviar lembrete para ${context.emailTo}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private getNotificationType(
    kind: VaccineReminderContext['kind'],
  ): ReminderType {
    switch (kind) {
      case 'BUY':
        return 'VACCINE_BUY';
      case 'APPLY':
        return 'VACCINE_APPLY';
      case 'DEFAULT':
      default:
        return 'VACCINE_DEFAULT';
    }
  }
}
