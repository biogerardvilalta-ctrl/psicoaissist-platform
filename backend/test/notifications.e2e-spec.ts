import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import { getAuthToken } from './helpers/auth.helper';

describe('NotificationsController (e2e)', () => {
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

    const user = await getAuthToken(app, { email: 'notifications-test@example.com' });
    authToken = user.token;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('/notifications (GET)', () => {
    it('should return list of notifications for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .expect(401);
    });
  });

  describe('/notifications/unread-count (GET)', () => {
    it('should return unread notifications count', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('count');
      expect(typeof response.body.count).toBe('number');
    });
  });

  describe('/notifications/read-all (PATCH)', () => {
    it('should mark all notifications as read', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/notifications/read-all')
        .expect(401);
    });
  });
});
