import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';

import { MedicationReminderService } from './medication-reminder.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { NotificationService } from './notification.service';
import { ReminderDateService } from './reminder-date.service';

describe('MedicationReminderService', () => {
  let service: MedicationReminderService;

  const prismaMock = {
    medication: {
      findMany: jest.fn(),
    },
  };

  const mailServiceMock = {
    sendMedicationReminder: jest.fn(),
  };

  const reminderDateServiceMock = {
    getMedicationReminderDateTime: jest.fn(),
    isSameMinute: jest.fn(),
    formatLocalDateTime: jest.fn(),
  };

  const notificationServiceMock = {
    hasSentAroundMinute: jest.fn(),
    registerSent: jest.fn(),
    registerFailed: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicationReminderService,
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

    service = module.get<MedicationReminderService>(MedicationReminderService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('process', () => {
    it('deve buscar medicamentos ativos com o filtro esperado', async () => {
      const now = new Date('2026-04-12T10:00:00.000Z');

      jest.useFakeTimers().setSystemTime(now);

      prismaMock.medication.findMany.mockResolvedValue([]);

      await service.process();

      expect(prismaMock.medication.findMany).toHaveBeenCalledWith({
        where: {
          time: {
            not: null,
          },
          startDate: {
            lte: new Date('2026-04-12T23:59:59.999Z'),
          },
          OR: [
            {
              endDate: null,
            },
            {
              endDate: {
                gte: new Date('2026-04-12T00:00:00.000Z'),
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
    });

    it('deve enviar lembrete e registrar sucesso quando estiver na mesma minute', async () => {
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation(() => undefined);

      const now = new Date('2026-04-12T10:00:00.000Z');
      const reminderDateTime = new Date('2026-04-12T10:00:00.000Z');

      jest.useFakeTimers().setSystemTime(now);

      prismaMock.medication.findMany.mockResolvedValue([
        {
          id: 'med-1',
          petId: 'pet-1',
          name: 'Prednisona',
          dosage: '1 comprimido',
          time: '11:00',
          reminderMinutesBefore: 60,
          startDate: new Date('2026-04-01T00:00:00.000Z'),
          endDate: new Date('2026-04-20T00:00:00.000Z'),
          pet: {
            name: 'Thor',
            user: {
              name: 'Ayslla',
              email: 'ayslla@email.com',
            },
          },
        },
      ]);

      reminderDateServiceMock.getMedicationReminderDateTime.mockReturnValue(
        reminderDateTime,
      );
      reminderDateServiceMock.isSameMinute.mockReturnValue(true);
      reminderDateServiceMock.formatLocalDateTime.mockReturnValue(
        '12/04/2026, 10:00:00',
      );

      notificationServiceMock.hasSentAroundMinute.mockResolvedValue(false);
      mailServiceMock.sendMedicationReminder.mockResolvedValue(undefined);
      notificationServiceMock.registerSent.mockResolvedValue(undefined);

      await service.process();

      expect(
        reminderDateServiceMock.getMedicationReminderDateTime,
      ).toHaveBeenCalledWith(now, '11:00', 60);

      expect(reminderDateServiceMock.isSameMinute).toHaveBeenCalledWith(
        now,
        reminderDateTime,
      );

      expect(notificationServiceMock.hasSentAroundMinute).toHaveBeenCalledWith({
        petId: 'pet-1',
        referenceId: 'med-1',
        type: 'MEDICATION',
        scheduledFor: reminderDateTime,
      });

      expect(mailServiceMock.sendMedicationReminder).toHaveBeenCalledWith({
        to: 'ayslla@email.com',
        tutorName: 'Ayslla',
        petName: 'Thor',
        medicationName: 'Prednisona',
        dosage: '1 comprimido',
        time: '11:00',
      });

      expect(notificationServiceMock.registerSent).toHaveBeenCalledWith({
        petId: 'pet-1',
        referenceId: 'med-1',
        type: 'MEDICATION',
        emailTo: 'ayslla@email.com',
        scheduledFor: reminderDateTime,
        message: 'Lembrete enviado para Prednisona',
      });

      expect(loggerSpy).toHaveBeenCalledWith(
        'Lembrete enviado para ayslla@email.com (Prednisona)',
      );
    });

    it('deve usar 60 como reminderMinutesBefore padrão quando vier nullish', async () => {
      const now = new Date('2026-04-12T10:00:00.000Z');
      const reminderDateTime = new Date('2026-04-12T10:00:00.000Z');

      jest.useFakeTimers().setSystemTime(now);

      prismaMock.medication.findMany.mockResolvedValue([
        {
          id: 'med-1',
          petId: 'pet-1',
          name: 'Prednisona',
          dosage: '1 comprimido',
          time: '11:00',
          reminderMinutesBefore: null,
          startDate: new Date('2026-04-01T00:00:00.000Z'),
          endDate: null,
          pet: {
            name: 'Thor',
            user: {
              name: 'Ayslla',
              email: 'ayslla@email.com',
            },
          },
        },
      ]);

      reminderDateServiceMock.getMedicationReminderDateTime.mockReturnValue(
        reminderDateTime,
      );
      reminderDateServiceMock.isSameMinute.mockReturnValue(false);
      reminderDateServiceMock.formatLocalDateTime.mockReturnValue(
        '12/04/2026, 10:00:00',
      );

      await service.process();

      expect(
        reminderDateServiceMock.getMedicationReminderDateTime,
      ).toHaveBeenCalledWith(now, '11:00', 60);
    });

    it('não deve enviar quando medication.time for null', async () => {
      const now = new Date('2026-04-12T10:00:00.000Z');

      jest.useFakeTimers().setSystemTime(now);

      prismaMock.medication.findMany.mockResolvedValue([
        {
          id: 'med-1',
          petId: 'pet-1',
          name: 'Prednisona',
          dosage: '1 comprimido',
          time: null,
          reminderMinutesBefore: 60,
          startDate: new Date('2026-04-01T00:00:00.000Z'),
          endDate: null,
          pet: {
            name: 'Thor',
            user: {
              name: 'Ayslla',
              email: 'ayslla@email.com',
            },
          },
        },
      ]);

      await service.process();

      expect(
        reminderDateServiceMock.getMedicationReminderDateTime,
      ).not.toHaveBeenCalled();
      expect(
        notificationServiceMock.hasSentAroundMinute,
      ).not.toHaveBeenCalled();
      expect(mailServiceMock.sendMedicationReminder).not.toHaveBeenCalled();
    });

    it('não deve enviar quando não for a mesma minute', async () => {
      const now = new Date('2026-04-12T10:00:00.000Z');
      const reminderDateTime = new Date('2026-04-12T09:00:00.000Z');

      jest.useFakeTimers().setSystemTime(now);

      prismaMock.medication.findMany.mockResolvedValue([
        {
          id: 'med-1',
          petId: 'pet-1',
          name: 'Prednisona',
          dosage: '1 comprimido',
          time: '10:00',
          reminderMinutesBefore: 60,
          startDate: new Date('2026-04-01T00:00:00.000Z'),
          endDate: null,
          pet: {
            name: 'Thor',
            user: {
              name: 'Ayslla',
              email: 'ayslla@email.com',
            },
          },
        },
      ]);

      reminderDateServiceMock.getMedicationReminderDateTime.mockReturnValue(
        reminderDateTime,
      );
      reminderDateServiceMock.isSameMinute.mockReturnValue(false);
      reminderDateServiceMock.formatLocalDateTime.mockReturnValue(
        '12/04/2026, 09:00:00',
      );

      await service.process();

      expect(
        notificationServiceMock.hasSentAroundMinute,
      ).not.toHaveBeenCalled();
      expect(mailServiceMock.sendMedicationReminder).not.toHaveBeenCalled();
      expect(notificationServiceMock.registerSent).not.toHaveBeenCalled();
    });

    it('não deve enviar quando já tiver sido enviado na janela de minuto', async () => {
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation(() => undefined);

      const now = new Date('2026-04-12T10:00:00.000Z');
      const reminderDateTime = new Date('2026-04-12T10:00:00.000Z');

      jest.useFakeTimers().setSystemTime(now);

      prismaMock.medication.findMany.mockResolvedValue([
        {
          id: 'med-1',
          petId: 'pet-1',
          name: 'Prednisona',
          dosage: '1 comprimido',
          time: '11:00',
          reminderMinutesBefore: 60,
          startDate: new Date('2026-04-01T00:00:00.000Z'),
          endDate: null,
          pet: {
            name: 'Thor',
            user: {
              name: 'Ayslla',
              email: 'ayslla@email.com',
            },
          },
        },
      ]);

      reminderDateServiceMock.getMedicationReminderDateTime.mockReturnValue(
        reminderDateTime,
      );
      reminderDateServiceMock.isSameMinute.mockReturnValue(true);
      reminderDateServiceMock.formatLocalDateTime.mockReturnValue(
        '12/04/2026, 10:00:00',
      );

      notificationServiceMock.hasSentAroundMinute.mockResolvedValue(true);

      await service.process();

      expect(mailServiceMock.sendMedicationReminder).not.toHaveBeenCalled();
      expect(notificationServiceMock.registerSent).not.toHaveBeenCalled();
      expect(notificationServiceMock.registerFailed).not.toHaveBeenCalled();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Notificação já enviada para Prednisona',
      );
    });

    it('deve registrar falha quando o envio de e-mail lançar Error', async () => {
      const loggerErrorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);

      const now = new Date('2026-04-12T10:00:00.000Z');
      const reminderDateTime = new Date('2026-04-12T10:00:00.000Z');
      const error = new Error('SMTP indisponível');

      jest.useFakeTimers().setSystemTime(now);

      prismaMock.medication.findMany.mockResolvedValue([
        {
          id: 'med-1',
          petId: 'pet-1',
          name: 'Prednisona',
          dosage: '1 comprimido',
          time: '11:00',
          reminderMinutesBefore: 60,
          startDate: new Date('2026-04-01T00:00:00.000Z'),
          endDate: null,
          pet: {
            name: 'Thor',
            user: {
              name: 'Ayslla',
              email: 'ayslla@email.com',
            },
          },
        },
      ]);

      reminderDateServiceMock.getMedicationReminderDateTime.mockReturnValue(
        reminderDateTime,
      );
      reminderDateServiceMock.isSameMinute.mockReturnValue(true);
      reminderDateServiceMock.formatLocalDateTime.mockReturnValue(
        '12/04/2026, 10:00:00',
      );

      notificationServiceMock.hasSentAroundMinute.mockResolvedValue(false);
      mailServiceMock.sendMedicationReminder.mockRejectedValue(error);

      await service.process();

      expect(notificationServiceMock.registerFailed).toHaveBeenCalledWith({
        petId: 'pet-1',
        referenceId: 'med-1',
        type: 'MEDICATION',
        emailTo: 'ayslla@email.com',
        scheduledFor: reminderDateTime,
        message: 'SMTP indisponível',
      });

      expect(notificationServiceMock.registerSent).not.toHaveBeenCalled();

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Erro ao enviar lembrete para ayslla@email.com',
        error.stack,
      );
    });

    it('deve registrar falha com "Erro desconhecido" quando o erro não for instance de Error', async () => {
      const now = new Date('2026-04-12T10:00:00.000Z');
      const reminderDateTime = new Date('2026-04-12T10:00:00.000Z');

      jest.useFakeTimers().setSystemTime(now);

      prismaMock.medication.findMany.mockResolvedValue([
        {
          id: 'med-1',
          petId: 'pet-1',
          name: 'Prednisona',
          dosage: '1 comprimido',
          time: '11:00',
          reminderMinutesBefore: 60,
          startDate: new Date('2026-04-01T00:00:00.000Z'),
          endDate: null,
          pet: {
            name: 'Thor',
            user: {
              name: 'Ayslla',
              email: 'ayslla@email.com',
            },
          },
        },
      ]);

      reminderDateServiceMock.getMedicationReminderDateTime.mockReturnValue(
        reminderDateTime,
      );
      reminderDateServiceMock.isSameMinute.mockReturnValue(true);
      reminderDateServiceMock.formatLocalDateTime.mockReturnValue(
        '12/04/2026, 10:00:00',
      );

      notificationServiceMock.hasSentAroundMinute.mockResolvedValue(false);
      mailServiceMock.sendMedicationReminder.mockRejectedValue(
        'falha qualquer',
      );

      await service.process();

      expect(notificationServiceMock.registerFailed).toHaveBeenCalledWith({
        petId: 'pet-1',
        referenceId: 'med-1',
        type: 'MEDICATION',
        emailTo: 'ayslla@email.com',
        scheduledFor: reminderDateTime,
        message: 'Erro desconhecido',
      });

      expect(notificationServiceMock.registerSent).not.toHaveBeenCalled();
    });
  });
});
