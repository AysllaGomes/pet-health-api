import { Injectable, Logger } from '@nestjs/common';

import { MailService } from '../../mail/mail.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from './notification.service';
import { ReminderDateService } from './reminder-date.service';

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

    for (const vaccine of vaccines) {
      if (!vaccine.nextDoseDate) continue;

      const plans = this.reminderDateService.buildVaccineReminderPlans(
        vaccine.category,
        vaccine.nextDoseDate,
        vaccine.reminderDaysBefore ?? 7,
      );

      for (const plan of plans) {
        if (plan.date.getTime() !== today.getTime()) {
          continue;
        }

        const type = `VACCINE_${plan.kind}`;

        const alreadySent = await this.notificationService.hasSentToday({
          petId: vaccine.petId,
          referenceId: vaccine.id,
          type,
          start: dayRange.start,
          end: dayRange.end,
        });

        if (alreadySent) continue;

        try {
          await this.mailService.sendVaccineReminder({
            to: vaccine.pet.user.email,
            tutorName: vaccine.pet.user.name,
            petName: vaccine.pet.name,
            vaccineName: vaccine.name,
            nextDoseDate: vaccine.nextDoseDate,
            reminderKind: plan.kind,
          });

          await this.notificationService.registerSent({
            petId: vaccine.petId,
            referenceId: vaccine.id,
            type,
            emailTo: vaccine.pet.user.email,
            scheduledFor: plan.date,
            message: `Lembrete ${plan.kind} enviado para ${vaccine.name}`,
          });
        } catch (error) {
          await this.notificationService.registerFailed({
            petId: vaccine.petId,
            referenceId: vaccine.id,
            type,
            emailTo: vaccine.pet.user.email,
            scheduledFor: plan.date,
            message:
              error instanceof Error ? error.message : 'Erro desconhecido',
          });

          this.logger.error(
            `Erro ao enviar lembrete para ${vaccine.pet.user.email}`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }
    }
  }
}
