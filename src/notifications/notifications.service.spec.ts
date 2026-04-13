import { Test, TestingModule } from '@nestjs/testing';

import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const prismaMock = {
    notification: {
      findMany: jest.fn(),
      count: jest.fn(),
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

  it('deve listar notificações do usuário com paginação padrão', async () => {
    const notifications = [
      {
        id: 'not-1',
        type: 'MEDICATION',
        status: 'SENT',
      },
    ];

    prismaMock.notification.findMany.mockResolvedValue(notifications);
    prismaMock.notification.count.mockResolvedValue(1);

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
      skip: 0,
      take: 10,
    });

    expect(prismaMock.notification.count).toHaveBeenCalledWith({
      where: {
        pet: {
          userId: 'user-1',
        },
      },
    });

    expect(result).toEqual({
      data: notifications,
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });
  });

  it('deve listar notificações com filtros e paginação', async () => {
    prismaMock.notification.findMany.mockResolvedValue([]);
    prismaMock.notification.count.mockResolvedValue(23);

    await service.findAll('user-1', {
      status: 'SENT',
      type: 'MEDICATION',
      petId: 'pet-1',
      page: 2,
      limit: 5,
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
      skip: 5,
      take: 5,
    });

    expect(prismaMock.notification.count).toHaveBeenCalledWith({
      where: {
        pet: {
          userId: 'user-1',
        },
        status: 'SENT',
        type: 'MEDICATION',
        petId: 'pet-1',
      },
    });
  });
});
