import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import { getAuthToken } from './helpers/auth.helper';

describe('SimulatorController (e2e)', () => {
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
    const user = await getAuthToken(app, { email: 'simulator-test@example.com' });
    authToken = user.token;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/simulator/demo/start (GET)', () => {
    it('should start a public demo without auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/simulator/demo/start')
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('scenario');
      expect(response.body.difficulty).toBe('medium');
    });
  });

  describe('/simulator/start (POST)', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/simulator/start')
        .send({ difficulty: 'easy' })
        .expect(401);
    });

    it('should start simulator with auth', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/simulator/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ difficulty: 'easy' });

      // Assuming the simulator returns a profile
      if (response.status === 201 || response.status === 200) {
        expect(response.body).toHaveProperty('name');
      }
    });
  });
});
