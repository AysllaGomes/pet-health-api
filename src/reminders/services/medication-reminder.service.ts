import { Injectable, Logger } from '@nestjs/common';

import { MailService } from '../../mail/mail.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from './notification.service';
import { ReminderDateService } from './reminder-date.service';

import { MedicationReminderContext } from '../types/reminder.types';

@Injectable()
export class MedicationReminderService {
  private readonly logger = new Logger(MedicationReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly reminderDateService: ReminderDateService,
    private readonly notificationService: NotificationService,
  ) {}

  async process(): Promise<void> {
    this.logger.log('Verificando medicamentos próximos...');

    const now = new Date();

    const dayStartUtc = new Date(now);
    dayStartUtc.setUTCHours(0, 0, 0, 0);

    const dayEndUtc = new Date(now);
    dayEndUtc.setUTCHours(23, 59, 59, 999);

    const medications = await this.prisma.medication.findMany({
      where: {
        time: {
          not: null,
        },
        startDate: {
          lte: dayEndUtc,
        },
        OR: [
          {
            endDate: null,
          },
          {
            endDate: {
              gte: dayStartUtc,
            },
          },
        ],
      },
      include: {
        pet: {
          include: {
            user: true,
          },
        },
      },
    });

    this.logger.log(`Medicamentos encontrados: ${medications.length}`);

    for (const medication of medications) {
      if (!medication.time) continue;

      const reminderDateTime =
        this.reminderDateService.getMedicationReminderDateTime(
          now,
          medication.time,
          medication.reminderMinutesBefore ?? 60,
        );

      const isSameMinute = this.reminderDateService.isSameMinute(
        now,
        reminderDateTime,
      );

      this.logger.log(
        `Medicamento=${medication.name} | time=${medication.time} | reminderAtLocal=${this.reminderDateService.formatLocalDateTime(reminderDateTime)} | nowLocal=${now.toLocaleString('pt-BR')}`,
      );

      if (!isSameMinute) {
        continue;
      }

      const alreadySent = await this.notificationService.hasSentAroundMinute({
        petId: medication.petId,
        referenceId: medication.id,
        type: 'MEDICATION',
        scheduledFor: reminderDateTime,
      });

      if (alreadySent) {
        this.logger.log(`Notificação já enviada para ${medication.name}`);
        continue;
      }

      const context: MedicationReminderContext = {
        petId: medication.petId,
        medicationId: medication.id,
        emailTo: medication.pet.user.email,
        tutorName: medication.pet.user.name,
        petName: medication.pet.name,
        medicationName: medication.name,
        dosage: medication.dosage,
        time: medication.time,
        scheduledFor: reminderDateTime,
      };

      await this.sendReminder(context);
    }
  }

  private async sendReminder(
    context: MedicationReminderContext,
  ): Promise<void> {
    try {
      await this.mailService.sendMedicationReminder({
        to: context.emailTo,
        tutorName: context.tutorName,
        petName: context.petName,
        medicationName: context.medicationName,
        dosage: context.dosage,
        time: context.time,
      });

      await this.notificationService.registerSent({
        petId: context.petId,
        referenceId: context.medicationId,
        type: 'MEDICATION',
        emailTo: context.emailTo,
        scheduledFor: context.scheduledFor,
        message: `Lembrete enviado para ${context.medicationName}`,
      });

      this.logger.log(
        `Lembrete enviado para ${context.emailTo} (${context.medicationName})`,
      );
    } catch (error) {
      await this.notificationService.registerFailed({
        petId: context.petId,
        referenceId: context.medicationId,
        type: 'MEDICATION',
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
}
