import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('NotificationsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let accessTokenUser1: string;
  let accessTokenUser2: string;

  let petIdUser1: string;
  let petIdUser2: string;

  const user1 = {
    name: 'Usuária Notification 1',
    email: `not_user1_${Date.now()}@email.com`,
    password: '123456',
  };

  const user2 = {
    name: 'Usuária Notification 2',
    email: `not_user2_${Date.now()}@email.com`,
    password: '123456',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);

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

    const petResponseUser1 = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send({
        name: 'Thor',
        species: 'dog',
        breed: 'Golden',
      })
      .expect(201);

    const petResponseUser2 = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .send({
        name: 'Luna',
        species: 'dog',
        breed: 'Poodle',
      })
      .expect(201);

    petIdUser1 = petResponseUser1.body.id;
    petIdUser2 = petResponseUser2.body.id;

    await prisma.notification.createMany({
      data: [
        {
          petId: petIdUser1,
          referenceId: 'ref-med-1',
          type: 'MEDICATION',
          emailTo: user1.email,
          scheduledFor: new Date('2026-04-13T08:00:00.000Z'),
          sentAt: new Date('2026-04-13T08:00:00.000Z'),
          status: 'SENT',
          message: 'Lembrete enviado para Prednisona',
        },
        {
          petId: petIdUser1,
          referenceId: 'ref-vac-1',
          type: 'VACCINE_DEFAULT',
          emailTo: user1.email,
          scheduledFor: new Date('2026-04-14T08:00:00.000Z'),
          status: 'FAILED',
          message: 'Falha ao enviar lembrete de vacina',
        },
        {
          petId: petIdUser2,
          referenceId: 'ref-med-2',
          type: 'MEDICATION',
          emailTo: user2.email,
          scheduledFor: new Date('2026-04-15T08:00:00.000Z'),
          sentAt: new Date('2026-04-15T08:00:00.000Z'),
          status: 'SENT',
          message: 'Lembrete enviado para antibiótico',
        },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve retornar 401 sem token', async () => {
    await request(app.getHttpServer()).get('/notifications').expect(401);
  });

  it('deve listar apenas notificações do usuário autenticado', async () => {
    const response = await request(app.getHttpServer())
      .get('/notifications')
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(2);

    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });

    expect(
      response.body.data.every((item: any) => item.pet?.id === petIdUser1),
    ).toBe(true);
  });

  it('não deve listar notificações de outro usuário', async () => {
    const response = await request(app.getHttpServer())
      .get('/notifications')
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(1);

    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });

    expect(
      response.body.data.every((item: any) => item.pet?.id === petIdUser2),
    ).toBe(true);
  });

  it('deve filtrar por status', async () => {
    const response = await request(app.getHttpServer())
      .get('/notifications?status=SENT')
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].status).toBe('SENT');
    expect(response.body.data[0].pet.id).toBe(petIdUser1);

    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });

  it('deve filtrar por type', async () => {
    const response = await request(app.getHttpServer())
      .get('/notifications?type=VACCINE_DEFAULT')
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].type).toBe('VACCINE_DEFAULT');
    expect(response.body.data[0].pet.id).toBe(petIdUser1);

    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });

  it('deve filtrar por petId', async () => {
    const response = await request(app.getHttpServer())
      .get(`/notifications?petId=${petIdUser1}`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
    expect(Array.isArray(response.body.data)).toBe(true);

    expect(
      response.body.data.every((item: any) => item.pet.id === petIdUser1),
    ).toBe(true);

    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });
  });

  it('deve combinar filtros', async () => {
    const response = await request(app.getHttpServer())
      .get(
        `/notifications?status=FAILED&type=VACCINE_DEFAULT&petId=${petIdUser1}`,
      )
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(1);

    expect(response.body.data[0]).toMatchObject({
      status: 'FAILED',
      type: 'VACCINE_DEFAULT',
      pet: {
        id: petIdUser1,
      },
    });

    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });

  it('não deve retornar dados de outro usuário mesmo com petId de outro usuário no filtro', async () => {
    const response = await request(app.getHttpServer())
      .get(`/notifications?petId=${petIdUser1}`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(0);

    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
  });

  it('deve retornar meta de paginação corretamente', async () => {
    const response = await request(app.getHttpServer())
      .get('/notifications?page=1&limit=1')
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(1);

    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 1,
      total: 2,
      totalPages: 2,
    });
  });
});
