import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const uniqueEmail = `ayslla_${Date.now()}@email.com`;
  const password = '123456';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve criar usuário com sucesso', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Ayslla Caroline',
        email: uniqueEmail,
        password,
      })
      .expect(201);
  });

  it('deve fazer login e retornar access_token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: uniqueEmail,
        password,
      })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
    expect(typeof response.body.access_token).toBe('string');
  });

  it('deve retornar 401 para senha inválida', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: uniqueEmail,
        password: 'senha-errada',
      })
      .expect(401);
  });

  it('deve retornar 401 para usuário inexistente', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'naoexiste@email.com',
        password: '123456',
      })
      .expect(401);
  });
});
