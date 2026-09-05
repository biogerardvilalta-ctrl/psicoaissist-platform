import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { getAuthToken } from './helpers/auth.helper';

describe('WebRTCController (e2e)', () => {
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

  describe('GET /api/v1/webrtc/ice-config', () => {
    it('should return ICE configuration for authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/webrtc/ice-config')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      // Should contain at least one ICE server (STUN or TURN)
      expect(res.body.iceServers).toBeDefined();
      expect(Array.isArray(res.body.iceServers)).toBe(true);
      expect(res.body.iceServers.length).toBeGreaterThan(0);
    });

    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .get('/api/v1/webrtc/ice-config')
        .expect(401);
    });
  });
});
