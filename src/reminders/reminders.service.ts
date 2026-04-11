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

  @Cron(CronExpression.EVERY_8_HOURS)
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
    category: 'VACCINE' | 'ANTIPARASITIC' | 'DEWORMER',
    nextDoseDate: Date,
    reminderDaysBefore: number,
  ): Array<{ kind: ReminderKind; date: Date }> {
    const isSpecialType =
      category === 'ANTIPARASITIC' || category === 'DEWORMER';

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

  @Cron(CronExpression.EVERY_MINUTE)
  async handleMedicationReminders(): Promise<void> {
    this.logger.log('Verificando medicamentos próximos...');

    const now = new Date();

    // janela do dia em UTC (para bater com o banco)
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

      const [hours, minutes] = medication.time.split(':').map(Number);

      // horário LOCAL do medicamento
      const medicationDateTime = new Date(now);
      medicationDateTime.setHours(hours, minutes, 0, 0);

      const reminderMinutesBefore = medication.reminderMinutesBefore ?? 60;

      const reminderDateTime = new Date(medicationDateTime);
      reminderDateTime.setMinutes(
        reminderDateTime.getMinutes() - reminderMinutesBefore,
      );

      // comparação por minuto (evita erro de milissegundos)
      const nowMinute = new Date(now);
      nowMinute.setSeconds(0, 0);

      const reminderMinute = new Date(reminderDateTime);
      reminderMinute.setSeconds(0, 0);

      this.logger.log(
        `Medicamento=${medication.name} | time=${medication.time} | reminderAtLocal=${reminderDateTime.toLocaleString(
          'pt-BR',
        )} | nowLocal=${now.toLocaleString('pt-BR')}`,
      );

      if (nowMinute.getTime() !== reminderMinute.getTime()) {
        continue;
      }

      // evita duplicidade
      const alreadySent = await this.prisma.notification.findFirst({
        where: {
          petId: medication.petId,
          referenceId: medication.id,
          type: 'MEDICATION',
          status: 'SENT',
          scheduledFor: {
            gte: new Date(reminderDateTime.getTime() - 60_000),
            lte: new Date(reminderDateTime.getTime() + 60_000),
          },
        },
      });

      if (alreadySent) {
        this.logger.log(`Notificação já enviada para ${medication.name}`);
        continue;
      }

      try {
        await this.mailService.sendMedicationReminder({
          to: medication.pet.user.email,
          tutorName: medication.pet.user.name,
          petName: medication.pet.name,
          medicationName: medication.name,
          dosage: medication.dosage,
          time: medication.time,
        });

        await this.prisma.notification.create({
          data: {
            petId: medication.petId,
            type: 'MEDICATION',
            referenceId: medication.id,
            emailTo: medication.pet.user.email,
            scheduledFor: reminderDateTime,
            sentAt: new Date(),
            status: 'SENT',
            message: `Lembrete enviado para ${medication.name}`,
          },
        });

        this.logger.log(
          `Lembrete enviado para ${medication.pet.user.email} (${medication.name})`,
        );
      } catch (error) {
        await this.prisma.notification.create({
          data: {
            petId: medication.petId,
            type: 'MEDICATION',
            referenceId: medication.id,
            emailTo: medication.pet.user.email,
            scheduledFor: reminderDateTime,
            status: 'FAILED',
            message:
              error instanceof Error ? error.message : 'Erro desconhecido',
          },
        });

        this.logger.error(
          `Erro ao enviar lembrete para ${medication.pet.user.email}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }
}
