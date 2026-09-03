import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import { getAuthToken } from './helpers/auth.helper';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('AdminController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let prisma: PrismaService;
  let adminUserId: string;

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
    await prisma.user.update({
      where: { email: 'admin-test@example.com' },
      data: { role: 'ADMIN' },
    });

    adminUserId = user.userId;
  });

  afterAll(async () => {
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
      // Use a freshly registered non-admin user
      const regularUser = await getAuthToken(app, { email: 'regular-for-admin-test@example.com' });

      await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${regularUser.token}`)
        .expect(403);
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
});
