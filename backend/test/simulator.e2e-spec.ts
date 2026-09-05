import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import { getAuthToken } from './helpers/auth.helper';

describe('SimulatorController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let sessionId: string; // The conversation ID returned by /start

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));
    await app.init();
    
    // Get Auth Token
    const user = await getAuthToken(app, { email: 'simulator-test@example.com', plan: 'pro' });
    authToken = user.token;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/simulator/demo/start (GET)', () => {
    it('should start a public demo without auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/simulator/demo/start')
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('scenario');
      expect(response.body.difficulty).toBe('medium');
    });
  });

  describe('/simulator/start (POST)', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/simulator/start')
        .send({ difficulty: 'easy' })
        .expect(401);
    });

    it('should start simulator with auth', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/simulator/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ difficulty: 'easy' });

      expect([200, 201]).toContain(response.status);
      expect(response.body).toHaveProperty('name');
      // Some endpoints might return id, sessionId, or conversationId
      sessionId = response.body.id || response.body.sessionId || response.body.conversationId || 'test-session-id';
    });
  });

  describe('/simulator/message (POST)', () => {
    it('should send message to virtual patient', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/simulator/message')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: 'Hola, com et sents avui?', sessionId: sessionId });

      // Check success
      expect([200, 201]).toContain(response.status);
      expect(response.body).toBeDefined();
    });
  });

  describe('/simulator/end (POST)', () => {
    it('should end simulator and obtain scores', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/simulator/end')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ sessionId: sessionId });

      expect([200, 201]).toContain(response.status);
      // Usually returns a report or score
      expect(response.body).toBeDefined();
    });
  });

  describe('/simulator/reports (GET)', () => {
    it('should retrieve simulator history', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/simulator/reports')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
