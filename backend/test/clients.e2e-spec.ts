import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import { getAuthToken } from './helpers/auth.helper';

describe('ClientsController (e2e)', () => {
  let app: INestApplication;
  let authToken1: string;
  let authToken2: string; // for testing cross-user access
  let createdClientId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }));
    await app.init();

    // Setup 2 users
    const user1 = await getAuthToken(app, { email: 'client-test-1@example.com' });
    authToken1 = user1.token;

    const user2 = await getAuthToken(app, { email: 'client-test-2@example.com' });
    authToken2 = user2.token;
  });

  afterAll(async () => {
    try {
      if (app) {
        await app.close();
      }
    } catch (e) {
      console.error('Error closing app', e);
    }
  });

  describe('/clients (POST)', () => {
    it('should create a new client', async () => {
      const clientDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+34600000000',
        tags: ['anxiety'],
        riskLevel: 'LOW'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(clientDto);

      if (response.status !== 201) {
        console.error('CREATE CLIENT FAILED:', response.body);
      }
      expect(response.status).toBe(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.firstName).toBe('John');
      expect(response.body.lastName).toBe('Doe');
      createdClientId = response.body.id;
    });

    it('should not allow unauthorized user to create client', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/clients')
        .send({ firstName: 'Anon', lastName: 'User' })
        .expect(401);
    });
  });

  describe('/clients (GET)', () => {
    it('should return list of active clients', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      const client = response.body.find((c: any) => c.id === createdClientId);
      expect(client).toBeDefined();
    });
  });

  describe('/clients/:id (GET)', () => {
    it('should return client details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/clients/${createdClientId}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      expect(response.body.id).toBe(createdClientId);
      expect(response.body.firstName).toBe('John');
    });

    it('should not allow another user to access the client', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/clients/${createdClientId}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .expect(404); // Or 403 depending on implementation
    });
  });

  describe('/clients/:id (PUT)', () => {
    it('should update client details', async () => {
      const updateDto = {
        firstName: 'Johnny',
        riskLevel: 'MEDIUM'
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/clients/${createdClientId}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.firstName).toBe('Johnny');
    });
  });

  describe('/clients/:id (DELETE)', () => {
    it('should archive (soft delete) a client', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/clients/${createdClientId}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      // Verify it's no longer in the active list
      const activeList = await request(app.getHttpServer())
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      expect(activeList.body.find((c: any) => c.id === createdClientId)).toBeUndefined();
    });

    it('should return list of inactive clients', async () => {
      const inactiveList = await request(app.getHttpServer())
        .get('/api/v1/clients?active=false')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      const client = inactiveList.body.find((c: any) => c.id === createdClientId);
      expect(client).toBeDefined();
    });
  });

  describe('/clients/permanent/:id (DELETE)', () => {
    it('should permanently delete a client', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/clients/permanent/${createdClientId}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      // Verify it's gone even from inactive
      const inactiveList = await request(app.getHttpServer())
        .get('/api/v1/clients?active=false')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      expect(inactiveList.body.find((c: any) => c.id === createdClientId)).toBeUndefined();
    });
  });
});
