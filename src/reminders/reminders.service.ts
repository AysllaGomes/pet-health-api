import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

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

      const reminderDaysBefore = vaccine.reminderDaysBefore ?? 7;

      const reminderDate = new Date(vaccine.nextDoseDate);
      reminderDate.setUTCDate(reminderDate.getUTCDate() - reminderDaysBefore);
      reminderDate.setUTCHours(0, 0, 0, 0);

      this.logger.log(
        `Vacina=${vaccine.name} | nextDoseDate=${vaccine.nextDoseDate.toISOString()} | reminderDate=${reminderDate.toISOString()} | today=${today.toISOString()}`,
      );

      if (reminderDate.getTime() !== today.getTime()) {
        continue;
      }

      try {
        await this.mailService.sendVaccineReminder({
          to: vaccine.pet.user.email,
          tutorName: vaccine.pet.user.name,
          petName: vaccine.pet.name,
          vaccineName: vaccine.name,
          nextDoseDate: vaccine.nextDoseDate,
        });

        this.logger.log(
          `Lembrete enviado para ${vaccine.pet.user.email} sobre ${vaccine.name} de ${vaccine.pet.name}`,
        );
      } catch (error) {
        this.logger.error(
          `Erro ao enviar lembrete para ${vaccine.pet.user.email}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }
}
