import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from '../src/app.module';

describe('VaccinesController (e2e)', () => {
  let app: INestApplication;

  let accessTokenUser1: string;
  let accessTokenUser2: string;
  let petIdUser1: string;

  const user1 = {
    name: 'Usuária Vacina 1',
    email: `vacc_user1_${Date.now()}@email.com`,
    password: '123456',
  };

  const user2 = {
    name: 'Usuária Vacina 2',
    email: `vacc_user2_${Date.now()}@email.com`,
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

    const petResponse = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send({
        name: 'Thor',
        species: 'dog',
        breed: 'Golden',
      })
      .expect(201);

    petIdUser1 = petResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve retornar 401 sem token', async () => {
    await request(app.getHttpServer()).get('/vaccines').expect(401);
  });

  it('deve criar vacina para pet do usuário autenticado', async () => {
    const response = await request(app.getHttpServer())
      .post('/vaccines')
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send({
        petId: petIdUser1,
        name: 'Vacina Anual',
        category: 'VACCINE',
        applicationDate: '2026-04-11',
        nextDoseDate: '2027-04-11',
        veterinarian: 'Dra. Ana',
        clinic: 'Clínica Pet Feliz',
        notes: 'Aplicação sem intercorrências',
        reminderDaysBefore: 7,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Vacina Anual');
    expect(response.body.petId).toBe(petIdUser1);
  });

  it('deve listar apenas vacinas dos pets do usuário autenticado', async () => {
    const response = await request(app.getHttpServer())
      .get('/vaccines')
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(
      response.body.data.some((item: any) => item.pet?.id === petIdUser1),
    ).toBe(true);

    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });

  it('deve retornar meta de paginação em /vaccines', async () => {
    await request(app.getHttpServer())
      .post('/vaccines')
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send({
        petId: petIdUser1,
        name: 'Antirrábica',
        category: 'VACCINE',
        applicationDate: '2026-04-12',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/vaccines?page=1&limit=1')
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

  it('não deve permitir criar vacina em pet de outro usuário', async () => {
    await request(app.getHttpServer())
      .post('/vaccines')
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .send({
        petId: petIdUser1,
        name: 'Vacina Indevida',
        category: 'VACCINE',
        applicationDate: '2026-04-11',
      })
      .expect(404);
  });

  it('não deve listar vacinas do pet de outro usuário', async () => {
    const response = await request(app.getHttpServer())
      .get('/vaccines')
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(
      response.body.data.some((item: any) => item.pet?.id === petIdUser1),
    ).toBe(false);
  });
});
