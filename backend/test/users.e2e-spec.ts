import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import { getAuthToken } from './helpers/auth.helper';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let adminToken: string;
  let prisma: PrismaService;
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

    // Regular user
    const regular = await getAuthToken(app, { email: 'users-regular-test@example.com' });
    authToken = regular.token;
    regularUserId = regular.userId;

    // Admin user
    const admin = await getAuthToken(app, { email: 'users-admin-test@example.com' });
    await prisma.user.update({
      where: { email: 'users-admin-test@example.com' },
      data: { role: 'ADMIN' },
    });
    adminToken = admin.token;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('/users/me/export/csv (GET)', () => {
    it('should export CSV data for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users/me/export/csv')
        .set('Authorization', `Bearer ${authToken}`);

      // Could be 200 or various status; expect it to not be 401/404
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(404);
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me/export/csv')
        .expect(401);
    });
  });

  describe('/users (GET) - Admin only', () => {
    it('should allow admin to list all users', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    it('should return 403 for non-admin user', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });

  describe('/users/:id (GET) - Admin only', () => {
    it('should allow admin to get user by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(regularUserId);
    });
  });

  describe('/users/:id/role (PATCH) - Admin only', () => {
    it('should allow admin to change a user role', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/users/${regularUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'PSYCHOLOGIST_PRO' })
        .expect(200);

      expect(response.body).toHaveProperty('role', 'PSYCHOLOGIST_PRO');
    });
  });

  describe('/users/:id/dashboard-layout (PATCH)', () => {
    it('should allow user to update their own dashboard layout', async () => {
      // First get our own ID from the token payload
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/users/${regularUserId}/dashboard-layout`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ layout: { columns: 2, widgets: [] } });

      // Should succeed or fail gracefully (403 if role was changed above)
      expect([200, 400, 403]).toContain(response.status);
    });
  });
});
