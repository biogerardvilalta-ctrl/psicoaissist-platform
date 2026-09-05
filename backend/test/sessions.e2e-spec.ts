import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import { getAuthToken } from './helpers/auth.helper';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('SessionsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let prisma: PrismaService;
  let createdClientId: string;
  let createdSessionId: string;

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
    
    prisma = app.get(PrismaService);

    // Get Auth Token
    const user = await getAuthToken(app, { email: 'session-test@example.com' });
    authToken = user.token;

    // Create a Client to associate sessions with
    const clientDto = {
      firstName: 'Session',
      lastName: 'Client',
      email: 'session.client@example.com',
    };

    const clientResponse = await request(app.getHttpServer())
      .post('/api/v1/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send(clientDto);
      
    createdClientId = clientResponse.body.id;
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

  describe('/sessions (POST)', () => {
    it('should create a new session', async () => {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 24); // Tomorrow
      
      const sessionDto = {
        clientId: createdClientId,
        startTime: startTime.toISOString(),
        sessionType: 'INDIVIDUAL',
        notes: 'Initial session notes'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sessionDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.clientId).toBe(createdClientId);
      expect(response.body.status).toBe('SCHEDULED');
      expect(response.body.sessionType).toBe('INDIVIDUAL');
      createdSessionId = response.body.id;
    });

    it('should not allow unauthorized user to create session', async () => {
      const sessionDto = {
        clientId: createdClientId,
        startTime: new Date().toISOString(),
      };

      await request(app.getHttpServer())
        .post('/api/v1/sessions')
        .send(sessionDto)
        .expect(401);
    });
  });

  describe('/sessions (GET)', () => {
    it('should return list of sessions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      const session = response.body.data.find((s: any) => s.id === createdSessionId);
      expect(session).toBeDefined();
    });
  });

  describe('/sessions/:id (GET)', () => {
    it('should return session details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/sessions/${createdSessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdSessionId);
      expect(response.body.clientId).toBe(createdClientId);
      expect(response.body.notes).toBe('Initial session notes');
    });
  });

  describe('/sessions/:id (PATCH)', () => {
    it('should update session status', async () => {
      const updateDto = {
        status: 'COMPLETED',
        notes: 'Session finished successfully'
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/sessions/${createdSessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.status).toBe('COMPLETED');
      expect(response.body.notes).toBe('Session finished successfully');
    });
  });

  describe('/sessions/:id (DELETE)', () => {
    it('should delete a session', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/sessions/${createdSessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify it's soft-deleted (status is CANCELLED)
      const getResponse = await request(app.getHttpServer())
        .get(`/api/v1/sessions/${createdSessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.status).toBe('CANCELLED');
    });
  });
});
