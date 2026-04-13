import { Test, TestingModule } from '@nestjs/testing';

import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const prismaMock = {
    notification: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve listar notificações do usuário sem filtros', async () => {
    const notifications = [
      {
        id: 'not-1',
        type: 'MEDICATION',
        status: 'SENT',
      },
    ];

    prismaMock.notification.findMany.mockResolvedValue(notifications);

    const result = await service.findAll('user-1', {});

    expect(prismaMock.notification.findMany).toHaveBeenCalledWith({
      where: {
        pet: {
          userId: 'user-1',
        },
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        scheduledFor: 'desc',
      },
    });

    expect(result).toEqual(notifications);
  });

  it('deve listar notificações com filtros', async () => {
    prismaMock.notification.findMany.mockResolvedValue([]);

    await service.findAll('user-1', {
      status: 'SENT',
      type: 'MEDICATION',
      petId: 'pet-1',
    });

    expect(prismaMock.notification.findMany).toHaveBeenCalledWith({
      where: {
        pet: {
          userId: 'user-1',
        },
        status: 'SENT',
        type: 'MEDICATION',
        petId: 'pet-1',
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        scheduledFor: 'desc',
      },
    });
  });
});
