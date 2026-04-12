import { Test, TestingModule } from '@nestjs/testing';

import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppService', () => {
  let service: AppService;

  const prismaMock = {
    user: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar a mensagem com o total de usuários', async () => {
    prismaMock.user.count.mockResolvedValue(5);

    const result = await service.getHello();

    expect(prismaMock.user.count).toHaveBeenCalledTimes(1);
    expect(result).toBe(`API online com Prisma. Total de usuários: 5`);
  });
});
