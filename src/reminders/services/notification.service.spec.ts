import { Test, TestingModule } from '@nestjs/testing';

import { NotificationService } from './notification.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('NotificationService', () => {
  let service: NotificationService;

  const prismaMock = {
    notification: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('hasSentToday', () => {
    it('deve retornar true quando encontrar uma notificação enviada no período', async () => {
      const params = {
        petId: 'pet-1',
        referenceId: 'ref-1',
        type: 'VACCINE',
        start: new Date('2026-04-12T00:00:00.000Z'),
        end: new Date('2026-04-12T23:59:59.999Z'),
      };

      prismaMock.notification.findFirst.mockResolvedValue({
        id: 'not-1',
        status: 'SENT',
      });

      const result = await service.hasSentToday(params);

      expect(prismaMock.notification.findFirst).toHaveBeenCalledWith({
        where: {
          petId: params.petId,
          referenceId: params.referenceId,
          type: params.type,
          status: 'SENT',
          scheduledFor: {
            gte: params.start,
            lte: params.end,
          },
        },
      });

      expect(result).toBe(true);
    });

    it('deve retornar false quando não encontrar notificação enviada no período', async () => {
      const params = {
        petId: 'pet-1',
        referenceId: 'ref-1',
        type: 'VACCINE',
        start: new Date('2026-04-12T00:00:00.000Z'),
        end: new Date('2026-04-12T23:59:59.999Z'),
      };

      prismaMock.notification.findFirst.mockResolvedValue(null);

      const result = await service.hasSentToday(params);

      expect(prismaMock.notification.findFirst).toHaveBeenCalledWith({
        where: {
          petId: params.petId,
          referenceId: params.referenceId,
          type: params.type,
          status: 'SENT',
          scheduledFor: {
            gte: params.start,
            lte: params.end,
          },
        },
      });

      expect(result).toBe(false);
    });
  });

  describe('hasSentAroundMinute', () => {
    it('deve retornar true quando encontrar notificação enviada na janela de 1 minuto', async () => {
      const scheduledFor = new Date('2026-04-12T10:30:00.000Z');

      const params = {
        petId: 'pet-1',
        referenceId: 'ref-1',
        type: 'MEDICATION',
        scheduledFor,
      };

      prismaMock.notification.findFirst.mockResolvedValue({
        id: 'not-1',
        status: 'SENT',
      });

      const result = await service.hasSentAroundMinute(params);

      expect(prismaMock.notification.findFirst).toHaveBeenCalledWith({
        where: {
          petId: params.petId,
          referenceId: params.referenceId,
          type: params.type,
          status: 'SENT',
          scheduledFor: {
            gte: new Date(scheduledFor.getTime() - 60_000),
            lte: new Date(scheduledFor.getTime() + 60_000),
          },
        },
      });

      expect(result).toBe(true);
    });

    it('deve retornar false quando não encontrar notificação enviada na janela de 1 minuto', async () => {
      const scheduledFor = new Date('2026-04-12T10:30:00.000Z');

      const params = {
        petId: 'pet-1',
        referenceId: 'ref-1',
        type: 'MEDICATION',
        scheduledFor,
      };

      prismaMock.notification.findFirst.mockResolvedValue(null);

      const result = await service.hasSentAroundMinute(params);

      expect(prismaMock.notification.findFirst).toHaveBeenCalledWith({
        where: {
          petId: params.petId,
          referenceId: params.referenceId,
          type: params.type,
          status: 'SENT',
          scheduledFor: {
            gte: new Date(scheduledFor.getTime() - 60_000),
            lte: new Date(scheduledFor.getTime() + 60_000),
          },
        },
      });

      expect(result).toBe(false);
    });
  });

  describe('registerSent', () => {
    it('deve registrar uma notificação enviada com status SENT', async () => {
      const data = {
        petId: 'pet-1',
        referenceId: 'ref-1',
        type: 'VACCINE',
        emailTo: 'ayslla@email.com',
        scheduledFor: new Date('2026-04-12T10:30:00.000Z'),
        message: 'Lembrete de vacina',
      };

      const createdNotification = {
        id: 'not-1',
        ...data,
        status: 'SENT',
        sentAt: new Date(),
      };

      prismaMock.notification.create.mockResolvedValue(createdNotification);

      const result = await service.registerSent(data);

      expect(prismaMock.notification.create).toHaveBeenCalledWith({
        data: {
          petId: data.petId,
          referenceId: data.referenceId,
          type: data.type,
          emailTo: data.emailTo,
          scheduledFor: data.scheduledFor,
          sentAt: expect.any(Date),
          status: 'SENT',
          message: data.message,
        },
      });

      expect(result).toEqual(createdNotification);
    });
  });

  describe('registerFailed', () => {
    it('deve registrar uma notificação com falha com status FAILED', async () => {
      const data = {
        petId: 'pet-1',
        referenceId: 'ref-1',
        type: 'VACCINE',
        emailTo: 'ayslla@email.com',
        scheduledFor: new Date('2026-04-12T10:30:00.000Z'),
        message: 'Falha ao enviar lembrete',
      };

      const createdNotification = {
        id: 'not-2',
        ...data,
        status: 'FAILED',
      };

      prismaMock.notification.create.mockResolvedValue(createdNotification);

      const result = await service.registerFailed(data);

      expect(prismaMock.notification.create).toHaveBeenCalledWith({
        data: {
          petId: data.petId,
          referenceId: data.referenceId,
          type: data.type,
          emailTo: data.emailTo,
          scheduledFor: data.scheduledFor,
          status: 'FAILED',
          message: data.message,
        },
      });

      expect(result).toEqual(createdNotification);
    });
  });
});
