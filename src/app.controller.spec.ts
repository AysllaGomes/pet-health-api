import { Test, TestingModule } from '@nestjs/testing';

import { AppService } from './app.service';

import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  const appServiceMock = {
    getHello: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: appServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve chamar o AppService e retornar o resultado', async () => {
    const mockResponse = 'API online com Prisma. Total de usuários: 10';
    appServiceMock.getHello.mockResolvedValue(mockResponse);

    const result = await controller.getHello();

    expect(appServiceMock.getHello).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockResponse);
  });
});
