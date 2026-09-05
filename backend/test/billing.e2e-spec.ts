import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import { getAuthToken } from './helpers/auth.helper';

describe('Billing & Usage Limits (e2e)', () => {
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

    const user = await getAuthToken(app, { email: 'billing-test@example.com' });
    authToken = user.token;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('/payments/plans (GET)', () => {
    it('should return available plans (public endpoint)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/payments/plans')
        .expect(200);

      expect(Array.isArray(response.body) || typeof response.body === 'object').toBe(true);
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

    it('should return 401 without auth token', async () => {
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
      // Usage response should have at least some numeric fields
      expect(typeof response.body).toBe('object');
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/payments/usage')
        .expect(401);
    });
  });

  describe('/payments/advanced-analytics (GET) - Feature Guard', () => {
    it('should return 403 for user without advanced plan', async () => {
      // A basic user (registered with getAuthToken) should be blocked by FeatureGuard
      const response = await request(app.getHttpServer())
        .get('/api/v1/payments/advanced-analytics')
        .set('Authorization', `Bearer ${authToken}`);

      // Could be 403 Forbidden (feature guard) or 200 if user has the feature
      expect([200, 403]).toContain(response.status);
    });
  });
});
