import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import { MailService } from './mail.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('MailService', () => {
  let service: MailService;

  const verifyMock = jest.fn();
  const sendMailMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.MAIL_HOST = 'smtp.test.com';
    process.env.MAIL_PORT = '587';
    process.env.MAIL_USER = 'user@test.com';
    process.env.MAIL_PASS = 'secret';
    process.env.MAIL_FROM = 'noreply@test.com';

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      verify: verifyMock,
      sendMail: sendMailMock,
    });

    service = new MailService();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('deve verificar o SMTP e registrar log de sucesso', async () => {
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation(() => undefined);

      verifyMock.mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(verifyMock).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalledWith('SMTP pronto para envio');
    });

    it('deve registrar erro quando a verificação do SMTP falhar', async () => {
      const loggerErrorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);

      const error = new Error('SMTP indisponível');
      verifyMock.mockRejectedValue(error);

      await service.onModuleInit();

      expect(verifyMock).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Falha ao verificar SMTP',
        error.stack,
      );
    });

    it('deve registrar erro com String(error) quando o erro não for instance de Error', async () => {
      const loggerErrorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);

      verifyMock.mockRejectedValue('erro-string');

      await service.onModuleInit();

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Falha ao verificar SMTP',
        'erro-string',
      );
    });
  });

  describe('sendVaccineReminder', () => {
    it('deve enviar lembrete padrão de vacina', async () => {
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation(() => undefined);

      sendMailMock.mockResolvedValue({ messageId: 'msg-1' });

      await service.sendVaccineReminder({
        to: 'ayslla@email.com',
        tutorName: 'Ayslla',
        petName: 'Thor',
        vaccineName: 'Vacina Anual',
        nextDoseDate: new Date('2026-04-20T00:00:00.000Z'),
        reminderKind: 'DEFAULT',
      });

      expect(sendMailMock).toHaveBeenCalledTimes(1);
      expect(sendMailMock).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'ayslla@email.com',
        subject: 'Lembrete de Vacina Anual do Thor',
        text: expect.stringContaining('Olá, Ayslla!'),
        html: expect.stringContaining('<strong>Ayslla</strong>'),
      });

      expect(loggerSpy).toHaveBeenCalledWith('E-mail aceito pelo SMTP: msg-1');
    });

    it('deve enviar lembrete do tipo BUY', async () => {
      sendMailMock.mockResolvedValue({ messageId: 'msg-2' });

      await service.sendVaccineReminder({
        to: 'ayslla@email.com',
        tutorName: 'Ayslla',
        petName: 'Thor',
        vaccineName: 'Antiparasitário',
        nextDoseDate: new Date('2026-04-20T00:00:00.000Z'),
        reminderKind: 'BUY',
      });

      expect(sendMailMock).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'ayslla@email.com',
        subject: 'Comprar Antiparasitário do Thor',
        text: expect.stringContaining('Hora de comprar o medicamento'),
        html: expect.stringContaining('Hora de comprar o medicamento'),
      });
    });

    it('deve enviar lembrete do tipo APPLY', async () => {
      sendMailMock.mockResolvedValue({ messageId: 'msg-3' });

      await service.sendVaccineReminder({
        to: 'ayslla@email.com',
        tutorName: 'Ayslla',
        petName: 'Thor',
        vaccineName: 'Vermífugo',
        nextDoseDate: new Date('2026-04-20T00:00:00.000Z'),
        reminderKind: 'APPLY',
      });

      expect(sendMailMock).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'ayslla@email.com',
        subject: 'Aplicar Vermífugo do Thor hoje',
        text: expect.stringContaining(
          'Hoje é o dia de aplicar Vermífugo no Thor.',
        ),
        html: expect.stringContaining(
          'Hoje é o dia de aplicar Vermífugo no Thor.',
        ),
      });
    });
  });

  describe('sendMedicationReminder', () => {
    it('deve enviar lembrete de medicamento', async () => {
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation(() => undefined);

      sendMailMock.mockResolvedValue({ messageId: 'msg-4' });

      await service.sendMedicationReminder({
        to: 'ayslla@email.com',
        tutorName: 'Ayslla',
        petName: 'Thor',
        medicationName: 'Prednisona',
        dosage: '1 comprimido',
        time: '08:00',
      });

      expect(sendMailMock).toHaveBeenCalledTimes(1);
      expect(sendMailMock).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'ayslla@email.com',
        subject: 'Lembrete de medicamento do Thor',
        text: 'Olá, Ayslla! O medicamento Prednisona (1 comprimido) do Thor está programado para 08:00.',
        html: expect.stringContaining('<strong>Prednisona</strong>'),
      });

      expect(loggerSpy).toHaveBeenCalledWith(
        'E-mail de medicamento aceito pelo SMTP: msg-4',
      );
    });
  });
});
