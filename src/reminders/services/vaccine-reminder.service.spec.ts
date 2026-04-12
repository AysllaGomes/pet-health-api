import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';

import { VaccineReminderService } from './vaccine-reminder.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { NotificationService } from './notification.service';
import { ReminderDateService } from './reminder-date.service';

describe('VaccineReminderService', () => {
  let service: VaccineReminderService;

  const prismaMock = {
    vaccine: {
      findMany: jest.fn(),
    },
  };

  const mailServiceMock = {
    sendVaccineReminder: jest.fn(),
  };

  const reminderDateServiceMock = {
    getUtcDayRange: jest.fn(),
    buildVaccineReminderPlans: jest.fn(),
  };

  const notificationServiceMock = {
    hasSentToday: jest.fn(),
    registerSent: jest.fn(),
    registerFailed: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VaccineReminderService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: MailService,
          useValue: mailServiceMock,
        },
        {
          provide: ReminderDateService,
          useValue: reminderDateServiceMock,
        },
        {
          provide: NotificationService,
          useValue: notificationServiceMock,
        },
      ],
    }).compile();

    service = module.get<VaccineReminderService>(VaccineReminderService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('process', () => {
    it('deve enviar lembrete DEFAULT e registrar sucesso', async () => {
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation(() => undefined);

      const now = new Date('2026-04-12T10:00:00.000Z');
      const today = new Date('2026-04-12T00:00:00.000Z');
      const dayRange = {
        start: new Date('2026-04-12T00:00:00.000Z'),
        end: new Date('2026-04-12T23:59:59.999Z'),
      };

      jest.useFakeTimers().setSystemTime(now);

      const vaccines = [
        {
          id: 'vac-1',
          petId: 'pet-1',
          name: 'Vacina Anual',
          category: 'VACCINE',
          nextDoseDate: new Date('2026-04-20T00:00:00.000Z'),
          reminderDaysBefore: 7,
          pet: {
            name: 'Thor',
            user: {
              name: 'Ayslla',
              email: 'ayslla@email.com',
            },
          },
        },
      ];

      prismaMock.vaccine.findMany.mockResolvedValue(vaccines);
      reminderDateServiceMock.getUtcDayRange.mockReturnValue(dayRange);
      reminderDateServiceMock.buildVaccineReminderPlans.mockReturnValue([
        { kind: 'DEFAULT', date: today },
      ]);
      notificationServiceMock.hasSentToday.mockResolvedValue(false);
      mailServiceMock.sendVaccineReminder.mockResolvedValue(undefined);
      notificationServiceMock.registerSent.mockResolvedValue(undefined);

      await service.process();

      expect(prismaMock.vaccine.findMany).toHaveBeenCalledWith({
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

      expect(reminderDateServiceMock.getUtcDayRange).toHaveBeenCalledWith(now);
      expect(
        reminderDateServiceMock.buildVaccineReminderPlans,
      ).toHaveBeenCalledWith('VACCINE', vaccines[0].nextDoseDate, 7);

      expect(notificationServiceMock.hasSentToday).toHaveBeenCalledWith({
        petId: 'pet-1',
        referenceId: 'vac-1',
        type: 'VACCINE_DEFAULT',
        start: dayRange.start,
        end: dayRange.end,
      });

      expect(mailServiceMock.sendVaccineReminder).toHaveBeenCalledWith({
        to: 'ayslla@email.com',
        tutorName: 'Ayslla',
        petName: 'Thor',
        vaccineName: 'Vacina Anual',
        nextDoseDate: vaccines[0].nextDoseDate,
        reminderKind: 'DEFAULT',
      });

      expect(notificationServiceMock.registerSent).toHaveBeenCalledWith({
        petId: 'pet-1',
        referenceId: 'vac-1',
        type: 'VACCINE_DEFAULT',
        emailTo: 'ayslla@email.com',
        scheduledFor: today,
        message: 'Lembrete DEFAULT enviado para Vacina Anual',
      });

      expect(loggerSpy).toHaveBeenCalledWith('Verificando vacinas próximas...');
      expect(loggerSpy).toHaveBeenCalledWith('Vacinas encontradas: 1');

      jest.useRealTimers();
    });

    it('deve enviar lembrete BUY e registrar sucesso com tipo VACCINE_BUY', async () => {
      const now = new Date('2026-04-12T10:00:00.000Z');
      const today = new Date('2026-04-12T00:00:00.000Z');
      const dayRange = {
        start: new Date('2026-04-12T00:00:00.000Z'),
        end: new Date('2026-04-12T23:59:59.999Z'),
      };

      jest.useFakeTimers().setSystemTime(now);

      const vaccines = [
        {
          id: 'vac-2',
          petId: 'pet-2',
          name: 'Antiparasitário',
          category: 'ANTIPARASITIC',
          nextDoseDate: new Date('2026-04-17T00:00:00.000Z'),
          reminderDaysBefore: 7,
          pet: {
            name: 'Luna',
            user: {
              name: 'Maria',
              email: 'maria@email.com',
            },
          },
        },
      ];

      prismaMock.vaccine.findMany.mockResolvedValue(vaccines);
      reminderDateServiceMock.getUtcDayRange.mockReturnValue(dayRange);
      reminderDateServiceMock.buildVaccineReminderPlans.mockReturnValue([
        { kind: 'BUY', date: today },
      ]);
      notificationServiceMock.hasSentToday.mockResolvedValue(false);
      mailServiceMock.sendVaccineReminder.mockResolvedValue(undefined);
      notificationServiceMock.registerSent.mockResolvedValue(undefined);

      await service.process();

      expect(notificationServiceMock.hasSentToday).toHaveBeenCalledWith({
        petId: 'pet-2',
        referenceId: 'vac-2',
        type: 'VACCINE_BUY',
        start: dayRange.start,
        end: dayRange.end,
      });

      expect(mailServiceMock.sendVaccineReminder).toHaveBeenCalledWith({
        to: 'maria@email.com',
        tutorName: 'Maria',
        petName: 'Luna',
        vaccineName: 'Antiparasitário',
        nextDoseDate: vaccines[0].nextDoseDate,
        reminderKind: 'BUY',
      });

      expect(notificationServiceMock.registerSent).toHaveBeenCalledWith({
        petId: 'pet-2',
        referenceId: 'vac-2',
        type: 'VACCINE_BUY',
        emailTo: 'maria@email.com',
        scheduledFor: today,
        message: 'Lembrete BUY enviado para Antiparasitário',
      });

      jest.useRealTimers();
    });

    it('deve enviar lembrete APPLY e registrar sucesso com tipo VACCINE_APPLY', async () => {
      const now = new Date('2026-04-12T10:00:00.000Z');
      const today = new Date('2026-04-12T00:00:00.000Z');
      const dayRange = {
        start: new Date('2026-04-12T00:00:00.000Z'),
        end: new Date('2026-04-12T23:59:59.999Z'),
      };

      jest.useFakeTimers().setSystemTime(now);

      const vaccines = [
        {
          id: 'vac-3',
          petId: 'pet-3',
          name: 'Vermífugo',
          category: 'DEWORMER',
          nextDoseDate: new Date('2026-04-12T00:00:00.000Z'),
          reminderDaysBefore: 7,
          pet: {
            name: 'Bob',
            user: {
              name: 'João',
              email: 'joao@email.com',
            },
          },
        },
      ];

      prismaMock.vaccine.findMany.mockResolvedValue(vaccines);
      reminderDateServiceMock.getUtcDayRange.mockReturnValue(dayRange);
      reminderDateServiceMock.buildVaccineReminderPlans.mockReturnValue([
        { kind: 'APPLY', date: today },
      ]);
      notificationServiceMock.hasSentToday.mockResolvedValue(false);
      mailServiceMock.sendVaccineReminder.mockResolvedValue(undefined);
      notificationServiceMock.registerSent.mockResolvedValue(undefined);

      await service.process();

      expect(notificationServiceMock.hasSentToday).toHaveBeenCalledWith({
        petId: 'pet-3',
        referenceId: 'vac-3',
        type: 'VACCINE_APPLY',
        start: dayRange.start,
        end: dayRange.end,
      });

      expect(notificationServiceMock.registerSent).toHaveBeenCalledWith({
        petId: 'pet-3',
        referenceId: 'vac-3',
        type: 'VACCINE_APPLY',
        emailTo: 'joao@email.com',
        scheduledFor: today,
        message: 'Lembrete APPLY enviado para Vermífugo',
      });

      jest.useRealTimers();
    });

    it('não deve enviar quando a data do plano não for hoje', async () => {
      const now = new Date('2026-04-12T10:00:00.000Z');
      const today = new Date('2026-04-12T00:00:00.000Z');
      const otherDay = new Date('2026-04-13T00:00:00.000Z');

      jest.useFakeTimers().setSystemTime(now);

      prismaMock.vaccine.findMany.mockResolvedValue([
        {
          id: 'vac-1',
          petId: 'pet-1',
          name: 'Vacina Anual',
          category: 'VACCINE',
          nextDoseDate: new Date('2026-04-20T00:00:00.000Z'),
          reminderDaysBefore: 7,
          pet: {
            name: 'Thor',
            user: {
              name: 'Ayslla',
              email: 'ayslla@email.com',
            },
          },
        },
      ]);

      reminderDateServiceMock.getUtcDayRange.mockReturnValue({
        start: today,
        end: new Date('2026-04-12T23:59:59.999Z'),
      });

      reminderDateServiceMock.buildVaccineReminderPlans.mockReturnValue([
        { kind: 'DEFAULT', date: otherDay },
      ]);

      await service.process();

      expect(notificationServiceMock.hasSentToday).not.toHaveBeenCalled();
      expect(mailServiceMock.sendVaccineReminder).not.toHaveBeenCalled();
      expect(notificationServiceMock.registerSent).not.toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('não deve enviar quando a vacina não tiver nextDoseDate', async () => {
      const now = new Date('2026-04-12T10:00:00.000Z');

      jest.useFakeTimers().setSystemTime(now);

      prismaMock.vaccine.findMany.mockResolvedValue([
        {
          id: 'vac-1',
          petId: 'pet-1',
          name: 'Vacina Anual',
          category: 'VACCINE',
          nextDoseDate: null,
          reminderDaysBefore: 7,
          pet: {
            name: 'Thor',
            user: {
              name: 'Ayslla',
              email: 'ayslla@email.com',
            },
          },
        },
      ]);

      reminderDateServiceMock.getUtcDayRange.mockReturnValue({
        start: new Date('2026-04-12T00:00:00.000Z'),
        end: new Date('2026-04-12T23:59:59.999Z'),
      });

      await service.process();

      expect(
        reminderDateServiceMock.buildVaccineReminderPlans,
      ).not.toHaveBeenCalled();
      expect(notificationServiceMock.hasSentToday).not.toHaveBeenCalled();
      expect(mailServiceMock.sendVaccineReminder).not.toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('não deve enviar quando a notificação já tiver sido enviada hoje', async () => {
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation(() => undefined);

      const now = new Date('2026-04-12T10:00:00.000Z');
      const today = new Date('2026-04-12T00:00:00.000Z');
      const dayRange = {
        start: new Date('2026-04-12T00:00:00.000Z'),
        end: new Date('2026-04-12T23:59:59.999Z'),
      };

      jest.useFakeTimers().setSystemTime(now);

      prismaMock.vaccine.findMany.mockResolvedValue([
        {
          id: 'vac-1',
          petId: 'pet-1',
          name: 'Vacina Anual',
          category: 'VACCINE',
          nextDoseDate: new Date('2026-04-20T00:00:00.000Z'),
          reminderDaysBefore: 7,
          pet: {
            name: 'Thor',
            user: {
              name: 'Ayslla',
              email: 'ayslla@email.com',
            },
          },
        },
      ]);

      reminderDateServiceMock.getUtcDayRange.mockReturnValue(dayRange);
      reminderDateServiceMock.buildVaccineReminderPlans.mockReturnValue([
        { kind: 'DEFAULT', date: today },
      ]);
      notificationServiceMock.hasSentToday.mockResolvedValue(true);

      await service.process();

      expect(mailServiceMock.sendVaccineReminder).not.toHaveBeenCalled();
      expect(notificationServiceMock.registerSent).not.toHaveBeenCalled();
      expect(notificationServiceMock.registerFailed).not.toHaveBeenCalled();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Notificação já enviada para vacina Vacina Anual (DEFAULT)',
      );

      jest.useRealTimers();
    });

    it('deve registrar falha quando o envio do e-mail lançar erro', async () => {
      const loggerErrorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);

      const now = new Date('2026-04-12T10:00:00.000Z');
      const today = new Date('2026-04-12T00:00:00.000Z');
      const dayRange = {
        start: new Date('2026-04-12T00:00:00.000Z'),
        end: new Date('2026-04-12T23:59:59.999Z'),
      };

      jest.useFakeTimers().setSystemTime(now);

      prismaMock.vaccine.findMany.mockResolvedValue([
        {
          id: 'vac-1',
          petId: 'pet-1',
          name: 'Vacina Anual',
          category: 'VACCINE',
          nextDoseDate: new Date('2026-04-20T00:00:00.000Z'),
          reminderDaysBefore: 7,
          pet: {
            name: 'Thor',
            user: {
              name: 'Ayslla',
              email: 'ayslla@email.com',
            },
          },
        },
      ]);

      reminderDateServiceMock.getUtcDayRange.mockReturnValue(dayRange);
      reminderDateServiceMock.buildVaccineReminderPlans.mockReturnValue([
        { kind: 'DEFAULT', date: today },
      ]);
      notificationServiceMock.hasSentToday.mockResolvedValue(false);

      const error = new Error('SMTP indisponível');
      mailServiceMock.sendVaccineReminder.mockRejectedValue(error);

      await service.process();

      expect(notificationServiceMock.registerFailed).toHaveBeenCalledWith({
        petId: 'pet-1',
        referenceId: 'vac-1',
        type: 'VACCINE_DEFAULT',
        emailTo: 'ayslla@email.com',
        scheduledFor: today,
        message: 'SMTP indisponível',
      });

      expect(notificationServiceMock.registerSent).not.toHaveBeenCalled();

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Erro ao enviar lembrete para ayslla@email.com',
        error.stack,
      );

      jest.useRealTimers();
    });

    it('deve registrar falha com "Erro desconhecido" quando o erro não for instance de Error', async () => {
      const now = new Date('2026-04-12T10:00:00.000Z');
      const today = new Date('2026-04-12T00:00:00.000Z');
      const dayRange = {
        start: new Date('2026-04-12T00:00:00.000Z'),
        end: new Date('2026-04-12T23:59:59.999Z'),
      };

      jest.useFakeTimers().setSystemTime(now);

      prismaMock.vaccine.findMany.mockResolvedValue([
        {
          id: 'vac-1',
          petId: 'pet-1',
          name: 'Vacina Anual',
          category: 'VACCINE',
          nextDoseDate: new Date('2026-04-20T00:00:00.000Z'),
          reminderDaysBefore: 7,
          pet: {
            name: 'Thor',
            user: {
              name: 'Ayslla',
              email: 'ayslla@email.com',
            },
          },
        },
      ]);

      reminderDateServiceMock.getUtcDayRange.mockReturnValue(dayRange);
      reminderDateServiceMock.buildVaccineReminderPlans.mockReturnValue([
        { kind: 'DEFAULT', date: today },
      ]);
      notificationServiceMock.hasSentToday.mockResolvedValue(false);

      mailServiceMock.sendVaccineReminder.mockRejectedValue('falha qualquer');

      await service.process();

      expect(notificationServiceMock.registerFailed).toHaveBeenCalledWith({
        petId: 'pet-1',
        referenceId: 'vac-1',
        type: 'VACCINE_DEFAULT',
        emailTo: 'ayslla@email.com',
        scheduledFor: today,
        message: 'Erro desconhecido',
      });

      expect(notificationServiceMock.registerSent).not.toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('deve usar 7 como reminderDaysBefore padrão quando vier nullish', async () => {
      const now = new Date('2026-04-12T10:00:00.000Z');
      const today = new Date('2026-04-12T00:00:00.000Z');

      jest.useFakeTimers().setSystemTime(now);

      prismaMock.vaccine.findMany.mockResolvedValue([
        {
          id: 'vac-1',
          petId: 'pet-1',
          name: 'Vacina Anual',
          category: 'VACCINE',
          nextDoseDate: new Date('2026-04-20T00:00:00.000Z'),
          reminderDaysBefore: null,
          pet: {
            name: 'Thor',
            user: {
              name: 'Ayslla',
              email: 'ayslla@email.com',
            },
          },
        },
      ]);

      reminderDateServiceMock.getUtcDayRange.mockReturnValue({
        start: today,
        end: new Date('2026-04-12T23:59:59.999Z'),
      });

      reminderDateServiceMock.buildVaccineReminderPlans.mockReturnValue([
        { kind: 'DEFAULT', date: today },
      ]);
      notificationServiceMock.hasSentToday.mockResolvedValue(true);

      await service.process();

      expect(
        reminderDateServiceMock.buildVaccineReminderPlans,
      ).toHaveBeenCalledWith(
        'VACCINE',
        new Date('2026-04-20T00:00:00.000Z'),
        7,
      );

      jest.useRealTimers();
    });
  });
});
