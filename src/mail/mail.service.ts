import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

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
  }): Promise<void> {
    const formattedDate = params.nextDoseDate.toLocaleDateString('pt-BR');

    const info = await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: params.to,
      subject: `Lembrete de vacina do ${params.petName}`,
      text: `Olá, ${params.tutorName}! A vacina ${params.vaccineName} do ${params.petName} está próxima da data prevista (${formattedDate}).`,
      html: `
        <p>Olá, <strong>${params.tutorName}</strong>!</p>
        <p>
          A vacina <strong>${params.vaccineName}</strong> do
          <strong>${params.petName}</strong> está próxima da data prevista:
          <strong>${formattedDate}</strong>.
        </p>
      `,
    });

    this.logger.log(`E-mail aceito pelo SMTP: ${info.messageId}`);
  }
}
