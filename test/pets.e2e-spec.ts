import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from '../src/app.module';

describe('PetsController (e2e)', () => {
  let app: INestApplication;

  let accessTokenUser1: string;
  let accessTokenUser2: string;
  let petIdUser1: string;

  const user1 = {
    name: 'Usuária 1',
    email: `user1_${Date.now()}@email.com`,
    password: '123456',
  };

  const user2 = {
    name: 'Usuária 2',
    email: `user2_${Date.now()}@email.com`,
    password: '123456',
  };

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

    await request(app.getHttpServer()).post('/users').send(user1).expect(201);
    await request(app.getHttpServer()).post('/users').send(user2).expect(201);

    const login1 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user1.email,
        password: user1.password,
      })
      .expect(201);

    const login2 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user2.email,
        password: user2.password,
      })
      .expect(201);

    accessTokenUser1 = login1.body.access_token;
    accessTokenUser2 = login2.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve retornar 401 sem token', async () => {
    await request(app.getHttpServer()).get('/pets').expect(401);
  });

  it('deve criar pet para o usuário autenticado', async () => {
    const response = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send({
        name: 'Thor',
        species: 'dog',
        breed: 'Golden',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Thor');

    petIdUser1 = response.body.id;
  });

  it('deve listar apenas pets do usuário autenticado', async () => {
    const response = await request(app.getHttpServer())
      .get('/pets')
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.some((pet: any) => pet.id === petIdUser1)).toBe(
      true,
    );

    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });

  it('deve retornar meta de paginação em /pets', async () => {
    await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send({
        name: 'Bolt',
        species: 'dog',
        breed: 'SRD',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/pets?page=1&limit=1')
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
    expect(response.body.data.length).toBe(1);

    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 1,
      total: 2,
      totalPages: 2,
    });
  });

  it('não deve permitir que outro usuário acesse o pet', async () => {
    await request(app.getHttpServer())
      .get(`/pets/${petIdUser1}`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .expect(404);
  });

  it('não deve permitir que outro usuário atualize o pet', async () => {
    await request(app.getHttpServer())
      .patch(`/pets/${petIdUser1}`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .send({
        name: 'Thor Hackeado',
      })
      .expect(404);
  });

  it('não deve permitir que outro usuário remova o pet', async () => {
    await request(app.getHttpServer())
      .delete(`/pets/${petIdUser1}`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .expect(404);
  });
});
