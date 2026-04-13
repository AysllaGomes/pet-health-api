import { Test, TestingModule } from '@nestjs/testing';

import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthService', () => {
  let service: HealthService;

  const prismaMock = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar status ok quando o banco responder', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const result = await service.check();

    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      status: 'ok',
      database: 'ok',
      timestamp: expect.any(String),
    });
  });

  it('deve retornar status error quando o banco falhar', async () => {
    prismaMock.$queryRaw.mockRejectedValue(new Error('db down'));

    const result = await service.check();

    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      status: 'error',
      database: 'down',
      timestamp: expect.any(String),
    });
  });
});
