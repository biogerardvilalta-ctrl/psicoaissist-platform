import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import { getAuthToken } from './helpers/auth.helper';

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
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));
    await app.init();
    
    // Get Auth Token
    const user = await getAuthToken(app, { email: 'payments-test@example.com' });
    authToken = user.token;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/payments/subscription (GET)', () => {
    it('should return subscription details for user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/payments/subscription')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('plan');
    });

    it('should not allow unauthorized user to see subscription', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/payments/subscription')
        .expect(401);
    });
  });

  describe('/payments/usage-limits (GET)', () => {
    it('should return usage limits details', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/payments/usage-limits')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('clientsLimit');
      expect(response.body).toHaveProperty('clientsUsed');
      expect(response.body).toHaveProperty('transcriptionMinutesLimit');
      expect(response.body).toHaveProperty('transcriptionMinutesUsed');
    });
  });
});
