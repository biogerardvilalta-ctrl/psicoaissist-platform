import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Health & Monitoring (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/health (GET)', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('checks');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(response.body.status);
    });
  });

  describe('/health/metrics (GET)', () => {
    it('should return system metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('metrics');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.metrics).toHaveProperty('activeUsers');
      expect(response.body.metrics).toHaveProperty('totalRequests');
      expect(response.body.metrics).toHaveProperty('errorRate');
      expect(response.body.metrics).toHaveProperty('avgResponseTime');
      expect(response.body.metrics).toHaveProperty('uptime');
    });
  });

  describe('/health/status (GET)', () => {
    it('should return comprehensive status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health/status')
        .expect(200);

      expect(response.body).toHaveProperty('health');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('performance');
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('timestamp');

      // Check memory object structure
      expect(response.body.memory).toHaveProperty('used');
      expect(response.body.memory).toHaveProperty('total');
      expect(response.body.memory).toHaveProperty('percentage');

      // Check performance object structure
      expect(response.body.performance).toHaveProperty('totalRequests');
      expect(response.body.performance).toHaveProperty('avgResponseTime');
      expect(response.body.performance).toHaveProperty('errorRate');
    });
  });
});