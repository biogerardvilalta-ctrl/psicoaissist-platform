import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { getAuthToken } from './helpers/auth.helper';

describe('GoogleController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let userEmail: string;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    const auth = await getAuthToken(app);
    token = auth.token;
    userEmail = auth.user.email;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: userEmail } });
    await app.close();
  });

  describe('GET /api/v1/google/auth-url', () => {
    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .get('/api/v1/google/auth-url')
        .expect(401);
    });

    it('should return a Google OAuth URL for authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/google/auth-url')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.url).toBeDefined();
      // The URL should be a Google OAuth URL
      expect(res.body.url).toContain('accounts.google.com');
    });
  });

  describe('GET /api/v1/google/events', () => {
    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .get('/api/v1/google/events')
        .expect(401);
    });

    it('should return 400 or graceful error if no Google token linked', async () => {
      // This user has no Google Calendar token linked, so it should
      // return a controlled error (not crash)
      const res = await request(app.getHttpServer())
        .get('/api/v1/google/events')
        .set('Authorization', `Bearer ${token}`);

      // Acceptable responses: 400 (no token), 404 (not found), or 200 (empty list)
      expect([200, 400, 404]).toContain(res.status);
    });
  });
});
