import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import { getAuthToken } from './helpers/auth.helper';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { UserRole } from '@prisma/client';

describe('AdminController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let prisma: PrismaService;
  let adminUserId: string;
  let regularUserId: string;

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

    // Register and verify admin user
    const user = await getAuthToken(app, { email: 'admin-test@example.com' });
    authToken = user.token;
    
    // Promote user to ADMIN role directly via Prisma
    const updatedUser = await prisma.user.update({
      where: { email: 'admin-test@example.com' },
      data: { role: UserRole.ADMIN },
    });
    adminUserId = updatedUser.id;

    const regularUser = await getAuthToken(app, { email: 'regular-for-admin-test@example.com' });
    const regUserDb = await prisma.user.findUnique({ where: { email: 'regular-for-admin-test@example.com' } });
    regularUserId = regUserDb.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: ['admin-test@example.com', 'regular-for-admin-test@example.com'] } } });
    if (app) await app.close();
  });

  describe('/admin/dashboard (GET)', () => {
    it('should return admin dashboard stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('activeUsers');
      expect(response.body).toHaveProperty('totalSessions');
    });

    it('should return 403 without admin role', async () => {
      const regularUser = await getAuthToken(app, { email: 'regular-for-admin-test2@example.com' });
      await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${regularUser.token}`)
        .expect(403);
      await prisma.user.deleteMany({ where: { email: 'regular-for-admin-test2@example.com' } });
    });
  });

  describe('/admin/logs (GET)', () => {
    it('should return audit logs for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/logs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      expect(Array.isArray(response.body.logs)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('/admin/stats/evolution (GET)', () => {
    it('should return evolution stats by period', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/stats/evolution?period=month')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/admin/stats/usage-evolution (GET)', () => {
    it('should return usage evolution stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/stats/usage-evolution')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/admin/plans (GET)', () => {
    it('should return plans breakdown', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body) || typeof response.body === 'object').toBe(true);
    });
  });

  describe('/admin/users/:id (PATCH)', () => {
    it('should update user via admin CRUD', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ role: 'PSYCHOLOGIST_PRO' })
        .expect(200);

      expect(response.body).toHaveProperty('role', 'PSYCHOLOGIST_PRO');
    });
  });
});
