import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import { getAuthToken } from './helpers/auth.helper';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { UserRole } from '@prisma/client';

describe('PaymentsController (e2e)', () => {
  let app: INestApplication;
  let authBasicToken: string;
  let authAdminToken: string;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);

    const userBasic = await getAuthToken(app, { email: 'payments-basic@example.com', plan: 'basic' });
    authBasicToken = userBasic.token;

    const userAdmin = await getAuthToken(app, { email: 'payments-admin@example.com', plan: 'pro' });
    authAdminToken = userAdmin.token;

    // Set admin role manually since getAuthToken creates PSYCHOLOGIST
    await prisma.user.update({
      where: { email: 'payments-admin@example.com' },
      data: { role: UserRole.ADMIN }
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: ['payments-basic@example.com', 'payments-admin@example.com'] } } });
    if (app) await app.close();
  });

  describe('/payments/plans (GET)', () => {
    it('should return available plans (public)', async () => {
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
        .set('Authorization', `Bearer ${authBasicToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status');
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
        .set('Authorization', `Bearer ${authBasicToken}`)
        .expect(200);

      expect(typeof response.body).toBe('object');
      expect(response.body).toHaveProperty('planType');
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/payments/usage')
        .expect(401);
    });
  });

  describe('Feature Guard & Admin Endpoints', () => {
    it('advanced-analytics guard (403 per Basic)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/payments/advanced-analytics')
        .set('Authorization', `Bearer ${authBasicToken}`);
      
      expect(response.status).toBe(403);
    });

    it('simulate-success (403 per non-admin)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/simulate-success')
        .set('Authorization', `Bearer ${authBasicToken}`);
      
      expect(response.status).toBe(403);
    });

    it('simulate-success (200/201 per admin)', async () => {
      const adminUser = await prisma.user.findUnique({ where: { email: 'payments-admin@example.com' } });
      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/simulate-success')
        .set('Authorization', `Bearer ${authAdminToken}`)
        .send({ userId: adminUser.id });
      
      expect([200, 201]).toContain(response.status);
    });
  });
});
