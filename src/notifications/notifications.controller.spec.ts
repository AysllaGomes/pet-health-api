import { Test, TestingModule } from '@nestjs/testing';

import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const notificationsServiceMock = {
    findAll: jest.fn(),
  };

  const currentUser = {
    userId: 'user-1',
    email: 'ayslla@email.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: notificationsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve chamar notificationsService.findAll com userId e query', async () => {
    const query = {
      status: 'SENT',
      type: 'MEDICATION',
      petId: 'pet-1',
    };

    const notifications = [
      {
        id: 'not-1',
        status: 'SENT',
      },
    ];

    notificationsServiceMock.findAll.mockResolvedValue(notifications);

    const result = await controller.findAll(currentUser, query);

    expect(notificationsServiceMock.findAll).toHaveBeenCalledTimes(1);
    expect(notificationsServiceMock.findAll).toHaveBeenCalledWith(
      'user-1',
      query,
    );
    expect(result).toEqual(notifications);
  });
});
