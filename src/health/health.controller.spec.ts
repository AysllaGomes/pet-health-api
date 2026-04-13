import { Test, TestingModule } from '@nestjs/testing';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;

  const healthServiceMock = {
    check: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: healthServiceMock,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve chamar healthService.check e retornar o resultado', async () => {
    const healthResult = {
      status: 'ok',
      database: 'ok',
      timestamp: new Date().toISOString(),
    };

    healthServiceMock.check.mockResolvedValue(healthResult);

    const result = await controller.check();

    expect(healthServiceMock.check).toHaveBeenCalledTimes(1);
    expect(result).toEqual(healthResult);
  });
});
