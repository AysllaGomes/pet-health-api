import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

type VaccineReminderKind = 'DEFAULT' | 'BUY' | 'APPLY';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);

  private readonly transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async onModuleInit(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP pronto para envio');
    } catch (error) {
      this.logger.error(
        'Falha ao verificar SMTP',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async sendVaccineReminder(params: {
    to: string;
    tutorName: string;
    petName: string;
    vaccineName: string;
    nextDoseDate: Date;
    reminderKind: VaccineReminderKind;
  }): Promise<void> {
    const formattedDate = params.nextDoseDate.toLocaleDateString('pt-BR');

    let subject = `Lembrete de ${params.vaccineName} do ${params.petName}`;
    let message = `A ${params.vaccineName} do ${params.petName} está próxima da data prevista (${formattedDate}).`;

    if (params.reminderKind === 'BUY') {
      subject = `Comprar ${params.vaccineName} do ${params.petName}`;
      message = `Faltam 5 dias para a aplicação de ${params.vaccineName} do ${params.petName}. Hora de comprar o medicamento para aplicar em ${formattedDate}.`;
    }

    if (params.reminderKind === 'APPLY') {
      subject = `Aplicar ${params.vaccineName} do ${params.petName} hoje`;
      message = `Hoje é o dia de aplicar ${params.vaccineName} no ${params.petName}.`;
    }

    const info = await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: params.to,
      subject,
      text: `Olá, ${params.tutorName}! ${message}`,
      html: `
        <p>Olá, <strong>${params.tutorName}</strong>!</p>
        <p>${message}</p>
      `,
    });

    this.logger.log(`E-mail aceito pelo SMTP: ${info.messageId}`);
  }
}