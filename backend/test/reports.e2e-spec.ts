import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import { getAuthToken } from './helpers/auth.helper';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('ReportsController (e2e)', () => {
  let app: INestApplication;
  let authUserToken: string;
  let authOtherUserToken: string;
  let prisma: PrismaService;
  let createdClientId: string;
  let createdSessionId: string;
  let createdReportId: string;
  let userId: string;

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

    // Create a PRO user to ensure no feature gating blocks us
    const proUser = await getAuthToken(app, { email: 'reports-pro@example.com', plan: 'pro' });
    authUserToken = proUser.token;
    const userDoc = await prisma.user.findUnique({ where: { email: 'reports-pro@example.com' } });
    userId = userDoc.id;

    const otherUser = await getAuthToken(app, { email: 'reports-other@example.com', plan: 'pro' });
    authOtherUserToken = otherUser.token;

    // Create prerequisite client
    const clientRes = await request(app.getHttpServer())
      .post('/api/v1/clients')
      .set('Authorization', `Bearer ${authUserToken}`)
      .send({ firstName: 'Report', lastName: 'Client', email: 'report.client@example.com' });
    createdClientId = clientRes.body.id;

    // Create prerequisite session
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 48);
    const sessionRes = await request(app.getHttpServer())
      .post('/api/v1/sessions')
      .set('Authorization', `Bearer ${authUserToken}`)
      .send({ clientId: createdClientId, startTime: startTime.toISOString(), sessionType: 'INDIVIDUAL' });
    createdSessionId = sessionRes.body.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.report.deleteMany({ where: { clientId: createdClientId }});
    await prisma.session.deleteMany({ where: { clientId: createdClientId }});
    await prisma.client.deleteMany({ where: { id: createdClientId }});
    await prisma.user.deleteMany({ where: { email: { in: ['reports-pro@example.com', 'reports-other@example.com'] } } });
    if (app) await app.close();
  });

  describe('/reports (POST)', () => {
    it('should create a new report successfully', async () => {
      const reportDto = {
        clientId: createdClientId,
        sessionId: createdSessionId,
        title: 'Test Report',
        content: 'This is a test report content.',
        reportType: 'CLINICAL_NOTES',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${authUserToken}`)
        .send(reportDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      createdReportId = response.body.id;
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/reports')
        .send({ title: 'Test', clientId: createdClientId })
        .expect(401);
    });
  });

  describe('/reports (GET)', () => {
    it('should list all reports for user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/reports')
        .set('Authorization', `Bearer ${authUserToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('/reports/:id (GET)', () => {
    it('should return report details for existing report', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/reports/${createdReportId}`)
        .set('Authorization', `Bearer ${authUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdReportId);
    });

    it('test informe d un altre usuari (403/404)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/reports/${createdReportId}`)
        .set('Authorization', `Bearer ${authOtherUserToken}`);

      expect([403, 404]).toContain(response.status);
    });
  });

  describe('Export reports', () => {
    it('test export PDF (verifica Content-Type)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/reports/${createdReportId}/export/pdf`)
        .set('Authorization', `Bearer ${authUserToken}`);

      // Assuming the endpoint is /reports/:id/export/pdf
      expect([200, 201]).toContain(response.status);
      expect(response.headers['content-type']).toContain('application/pdf');
    });

    it('test export DOCX', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/reports/${createdReportId}/export/docx`)
        .set('Authorization', `Bearer ${authUserToken}`);

      expect([200, 201]).toContain(response.status);
      expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });
  });
});
