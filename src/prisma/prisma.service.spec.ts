import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.clearAllMocks();
  });

  it('deve estar definido quando DATABASE_URL existir', () => {
    process.env.DATABASE_URL = 'postgresql://test';

    const service = new PrismaService();

    expect(service).toBeDefined();
  });

  it('deve lançar erro quando DATABASE_URL não estiver definido', () => {
    delete process.env.DATABASE_URL;

    expect(() => new PrismaService()).toThrow('DATABASE_URL is not defined');
  });

  describe('onModuleInit', () => {
    it('deve chamar $connect', async () => {
      process.env.DATABASE_URL = 'postgresql://test';

      const service = new PrismaService();

      const connectSpy = jest
        .spyOn(service, '$connect')
        .mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('enableShutdownHooks', () => {
    it('deve registrar o hook beforeExit e chamar app.close', () => {
      process.env.DATABASE_URL = 'postgresql://test';

      const service = new PrismaService();

      const appMock = {
        close: jest.fn(),
      } as any;

      const onSpy = jest.spyOn(process, 'on');

      service.enableShutdownHooks(appMock);

      expect(onSpy).toHaveBeenCalledWith('beforeExit', expect.any(Function));

      // captura o callback registrado
      const callback = onSpy.mock.calls[0][1];

      callback(); // simula o evento

      expect(appMock.close).toHaveBeenCalledTimes(1);
    });
  });
});
