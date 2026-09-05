import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import { getAuthToken } from './helpers/auth.helper';

/**
 * NOTE: The route /payments/subscription does NOT exist.
 * Real routes: /payments/subscription-status, /payments/usage, /payments/plans
 * This file replaces the old erroneous payments.e2e-spec.ts
 */
describe('PaymentsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const user = await getAuthToken(app, { email: 'payments-v2-test@example.com' });
    authToken = user.token;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('/payments/plans (GET)', () => {
    it('should return available plans (public)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/payments/plans')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('/payments/subscription-status (GET)', () => {
    it('should return subscription status for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/payments/subscription-status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/payments/subscription-status')
        .expect(401);
    });
  });

  describe('/payments/usage (GET)', () => {
    it('should return usage data for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/payments/usage')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/payments/usage')
        .expect(401);
    });
  });
});
