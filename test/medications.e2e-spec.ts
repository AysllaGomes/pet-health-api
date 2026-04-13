import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from '../src/app.module';

describe('MedicationsController (e2e)', () => {
  let app: INestApplication;

  let accessTokenUser1: string;
  let accessTokenUser2: string;
  let petIdUser1: string;
  let medicationIdUser1: string;

  const user1 = {
    name: 'Usuária Medication 1',
    email: `med_user1_${Date.now()}@email.com`,
    password: '123456',
  };

  const user2 = {
    name: 'Usuária Medication 2',
    email: `med_user2_${Date.now()}@email.com`,
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
        name: 'Luna',
        species: 'dog',
        breed: 'Poodle',
      })
      .expect(201);

    petIdUser1 = petResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve retornar 401 sem token', async () => {
    await request(app.getHttpServer()).get('/medications').expect(401);
  });

  it('deve criar medicamento para pet do usuário autenticado', async () => {
    const response = await request(app.getHttpServer())
      .post('/medications')
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send({
        petId: petIdUser1,
        name: 'Prednisona',
        dosage: '1 comprimido',
        frequency: '1x ao dia',
        startDate: '2026-04-11',
        endDate: '2026-04-20',
        time: '08:00',
        notes: 'Dar junto com alimento',
        reminderMinutesBefore: 30,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Prednisona');
    expect(response.body.petId).toBe(petIdUser1);

    medicationIdUser1 = response.body.id;
  });

  it('deve listar apenas medicamentos dos pets do usuário autenticado', async () => {
    const response = await request(app.getHttpServer())
      .get('/medications')
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((item: any) => item.pet?.id === petIdUser1)).toBe(
      true,
    );
  });

  it('não deve permitir criar medicamento em pet de outro usuário', async () => {
    await request(app.getHttpServer())
      .post('/medications')
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .send({
        petId: petIdUser1,
        name: 'Remédio Indevido',
        dosage: '1 comprimido',
        frequency: '1x ao dia',
        startDate: '2026-04-11',
      })
      .expect(404);
  });

  it('não deve listar medicamentos do pet de outro usuário', async () => {
    const response = await request(app.getHttpServer())
      .get('/medications')
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(
      response.body.some((item: any) => item.id === medicationIdUser1),
    ).toBe(false);
  });

  it('não deve permitir que outro usuário acesse o medicamento', async () => {
    await request(app.getHttpServer())
      .get(`/medications/${medicationIdUser1}`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .expect(404);
  });

  it('não deve permitir que outro usuário atualize o medicamento', async () => {
    await request(app.getHttpServer())
      .patch(`/medications/${medicationIdUser1}`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .send({
        name: 'Prednisona Hackeada',
      })
      .expect(404);
  });

  it('não deve permitir que outro usuário remova o medicamento', async () => {
    await request(app.getHttpServer())
      .delete(`/medications/${medicationIdUser1}`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .expect(404);
  });
});
