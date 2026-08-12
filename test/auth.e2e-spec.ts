// create e2e test for auth functionality
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users/signup (POST)', () => {
    return request(app.getHttpServer())
      .post('/users/signup')
      .send({
        name: 'Ada Lovelace',
        email: 'ada1@example.com',
        password: 'password123',
      })
      .expect(201)
      .then((response) => {
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toEqual('Ada Lovelace');
        expect(response.body.email).toEqual('ada1@example.com');
      });
  });

  it('/users/signin (POST)', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent.post('/users/signup').send({
      name: 'Ada Lovelace',
      email: 'ada1@example.com',
      password: 'password123',
    });

    return agent
      .post('/users/signin')
      .send({ email: 'ada1@example.com', password: 'password123' })
      .expect(201)
      .then((response) => {
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toEqual('Ada Lovelace');
        expect(response.body.email).toEqual('ada1@example.com');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
