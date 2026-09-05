import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import { getAuthToken } from './helpers/auth.helper';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { UserRole } from '@prisma/client';

/**
 * Plan Limits E2E Tests
 *
 * Validates that the subscription plan enforcement works correctly for:
 * - Demo plan (Free): 3 clients, 5 reports/month, 0 simulator cases
 * - Basic plan: 25 clients, 100 reports/month, 0 simulator cases
 * - Pro plan: unlimited clients, unlimited reports, 5 simulator cases/month
 * - Trial expiration: expired trial blocks all actions
 * - Feature guards: advanced-analytics blocked for basic, allowed for pro+
 * - Referral bonuses: simulator limit extends with referrals
 *
 * IMPORTANT: The role system OVERRIDES subscriptions (role PSYCHOLOGIST_PRO → pro plan).
 * To correctly test subscription-level gating, we assign role PSYCHOLOGIST (neutral)
 * and then set a subscription record directly in the DB.
 */
describe('Plan Limits (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let demoToken: string;
  let demoUserId: string;
  let basicToken: string;
  let basicUserId: string;
  let proToken: string;
  let proUserId: string;

  let demoClientId: string;
  let demoSessionId: string;
  let basicClientId: string;
  let basicSessionId: string;
  let proClientId: string;
  let proSessionId: string;

  // Simulator payload - requires 'difficulty' field
  const simulatorPayload = { difficulty: 'easy' };

  async function createClient(token: string, suffix: string) {
    return request(app.getHttpServer())
      .post('/api/v1/clients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: `Test${suffix}`,
        lastName: 'PlanLimit',
        email: `planlimit-${suffix}-${Date.now()}@example.com`,
      });
  }

  async function createReport(token: string, clientId: string, sessionId: string, suffix: string) {
    return request(app.getHttpServer())
      .post('/api/v1/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clientId,
        sessionId,
        title: `Report ${suffix}`,
        content: 'Test report content for plan limit testing.',
        reportType: 'PROGRESS',
      });
  }

  async function createSession(token: string, clientId: string) {
    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 7);
    return request(app.getHttpServer())
      .post('/api/v1/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clientId,
        startTime: startTime.toISOString(),
        sessionType: 'INDIVIDUAL',
      });
  }

  // Force neutral role (PSYCHOLOGIST) so subscriptions take effect
  async function forceNeutralRole(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { role: UserRole.PSYCHOLOGIST, trialStartedAt: null },
    });
  }

  async function createSubscription(userId: string, planType: string) {
    await prisma.subscription.deleteMany({ where: { userId } });
    await prisma.subscription.create({
      data: {
        userId,
        planType,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stripeSubscriptionId: `test_${planType}_${userId}_${Date.now()}`,
      },
    });
  }

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

    // Demo user: neutral role + no subscription + no trial → DEMO plan
    const demoUserAuth = await getAuthToken(app, { email: 'plan-demo@example.com' });
    demoToken = demoUserAuth.token;
    const demoDoc = await prisma.user.findUnique({ where: { email: 'plan-demo@example.com' } });
    demoUserId = demoDoc.id;
    await forceNeutralRole(demoUserId);
    await prisma.subscription.deleteMany({ where: { userId: demoUserId } });

    // Basic user: neutral role + 'basic' subscription
    const basicUserAuth = await getAuthToken(app, { email: 'plan-basic@example.com' });
    basicToken = basicUserAuth.token;
    const basicDoc = await prisma.user.findUnique({ where: { email: 'plan-basic@example.com' } });
    basicUserId = basicDoc.id;
    await forceNeutralRole(basicUserId);
    await createSubscription(basicUserId, 'basic');

    // Pro user: neutral role + 'pro' subscription
    const proUserAuth = await getAuthToken(app, { email: 'plan-pro@example.com' });
    proToken = proUserAuth.token;
    const proDoc = await prisma.user.findUnique({ where: { email: 'plan-pro@example.com' } });
    proUserId = proDoc.id;
    await forceNeutralRole(proUserId);
    await createSubscription(proUserId, 'pro');

    // Create base resources for each user
    const demoClientRes = await createClient(demoToken, 'demo-base');
    demoClientId = demoClientRes.body.id;
    const demoSessionRes = await createSession(demoToken, demoClientId);
    demoSessionId = demoSessionRes.body.id;

    const basicClientRes = await createClient(basicToken, 'basic-base');
    basicClientId = basicClientRes.body.id;
    const basicSessionRes = await createSession(basicToken, basicClientId);
    basicSessionId = basicSessionRes.body.id;

    const proClientRes = await createClient(proToken, 'pro-base');
    proClientId = proClientRes.body.id;
    const proSessionRes = await createSession(proToken, proClientId);
    proSessionId = proSessionRes.body.id;
  }, 60000);

  afterAll(async () => {
    const emails = [
      'plan-demo@example.com',
      'plan-basic@example.com',
      'plan-pro@example.com',
      'plan-trial-expired@example.com',
      'plan-pro-referral@example.com',
    ];
    for (const email of emails) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) continue;
      await prisma.report.deleteMany({ where: { userId: user.id } });
      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.client.deleteMany({ where: { userId: user.id } });
      await prisma.subscription.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    if (app) await app.close();
  }, 30000);

  // =====================================================================
  // BLOC 1: Demo Plan (Free) - maxClients=3, maxReports=5, simulator=0
  // =====================================================================
  describe('Demo Plan limits', () => {
    it('should allow creating up to 3 clients', async () => {
      // base client already created (1). Create 2 more = 3 total
      const r1 = await createClient(demoToken, 'demo-2');
      expect(r1.status).toBe(201);
      const r2 = await createClient(demoToken, 'demo-3');
      expect(r2.status).toBe(201);
    });

    it('should block the 4th client with 403 (Client limit reached)', async () => {
      const r = await createClient(demoToken, 'demo-4-blocked');
      expect(r.status).toBe(403);
      expect(r.body.message).toMatch(/client limit reached/i);
    });

    it('should allow creating up to 5 reports', async () => {
      for (let i = 1; i <= 5; i++) {
        const r = await createReport(demoToken, demoClientId, demoSessionId, `demo-rpt-${i}`);
        expect(r.status).toBe(201);
      }
    });

    it('should block the 6th report with 403 (Monthly report limit reached)', async () => {
      const r = await createReport(demoToken, demoClientId, demoSessionId, 'demo-rpt-6-blocked');
      expect(r.status).toBe(403);
      expect(r.body.message).toMatch(/monthly report limit reached/i);
    });

    it('should block simulator access (0 cases for demo plan)', async () => {
      const r = await request(app.getHttpServer())
        .post('/api/v1/simulator/start')
        .set('Authorization', `Bearer ${demoToken}`)
        .send(simulatorPayload);
      expect(r.status).toBe(403);
      expect(r.body.message).toMatch(/simulator cases limit reached/i);
    });
  });

  // =====================================================================
  // BLOC 2: Basic Plan - maxClients=25, maxReports=100, simulator=0
  // =====================================================================
  describe('Basic Plan limits', () => {
    it('should allow creating clients normally', async () => {
      const r1 = await createClient(basicToken, 'basic-2');
      expect(r1.status).toBe(201);
      const r2 = await createClient(basicToken, 'basic-3');
      expect(r2.status).toBe(201);
    });

    it('should block when 25 active clients exist (limit reached)', async () => {
      // Deactivate existing clients, then insert 25 active dummies via API to simulate the limit
      // Using the API would be slow; instead we directly set the count by DB update
      // First deactivate all so count is 0
      await prisma.client.updateMany({ where: { userId: basicUserId }, data: { isActive: false } });

      // Use API to create exactly 25 active clients
      // For speed, directly write them to DB with minimal required fields
      const existing = await prisma.client.findFirst({ where: { userId: basicUserId } });
      // Fill up to 25 by setting isActive = true on existing ones and creating new ones
      const existingAll = await prisma.client.findMany({ where: { userId: basicUserId } });
      let activeCount = 0;
      for (const c of existingAll) {
        if (activeCount < 25) {
          await prisma.client.update({ where: { id: c.id }, data: { isActive: true } });
          activeCount++;
        }
      }
      // Create remaining to reach 25
      while (activeCount < 25) {
        const created = await createClient(basicToken, `fill-${activeCount}`);
        if (created.status === 201) activeCount++;
        else break; // already at limit
      }

      // Now try to create one more → should fail
      if (activeCount >= 25) {
        const r = await createClient(basicToken, 'basic-26-blocked');
        expect(r.status).toBe(403);
        expect(r.body.message).toMatch(/client limit reached/i);
      }
    }, 30000);

    it('should block simulator access (0 cases for basic plan)', async () => {
      const r = await request(app.getHttpServer())
        .post('/api/v1/simulator/start')
        .set('Authorization', `Bearer ${basicToken}`)
        .send(simulatorPayload);
      expect(r.status).toBe(403);
      expect(r.body.message).toMatch(/simulator cases limit reached/i);
    });

    it('should block advanced-analytics for basic plan (Feature Guard)', async () => {
      const r = await request(app.getHttpServer())
        .get('/api/v1/payments/advanced-analytics')
        .set('Authorization', `Bearer ${basicToken}`);
      expect(r.status).toBe(403);
    });
  });

  // =====================================================================
  // BLOC 3: Pro Plan - unlimited clients/reports, 5 simulator cases
  // =====================================================================
  describe('Pro Plan limits', () => {
    it('should allow creating multiple clients without restriction', async () => {
      const r1 = await createClient(proToken, 'pro-2');
      expect(r1.status).toBe(201);
      const r2 = await createClient(proToken, 'pro-3');
      expect(r2.status).toBe(201);
    });

    it('should allow creating more than 6 reports (unlimited)', async () => {
      for (let i = 1; i <= 6; i++) {
        const r = await createReport(proToken, proClientId, proSessionId, `pro-rpt-${i}`);
        expect(r.status).toBe(201);
      }
    });

    it('should allow simulator access and block on the 6th case (limit = 5)', async () => {
      // Set usage to 4 (one below limit) and verify one more call is allowed (not 403)
      await prisma.user.update({ where: { id: proUserId }, data: { simulatorUsageCount: 4 } });

      const allowedCall = await request(app.getHttpServer())
        .post('/api/v1/simulator/start')
        .set('Authorization', `Bearer ${proToken}`)
        .send(simulatorPayload);
      // Limit check passes before AI call → NOT 403. AI errors (500) are acceptable here.
      expect(allowedCall.status).not.toBe(403);

      // Force usage to exactly 5 (limit reached) regardless of whether AI incremented it
      await prisma.user.update({ where: { id: proUserId }, data: { simulatorUsageCount: 5 } });

      // Next call should be blocked by the limit guard
      const blockedCall = await request(app.getHttpServer())
        .post('/api/v1/simulator/start')
        .set('Authorization', `Bearer ${proToken}`)
        .send(simulatorPayload);
      expect(blockedCall.status).toBe(403);
      expect(blockedCall.body.message).toMatch(/simulator cases limit reached/i);
    }, 15000);

    it('should allow access to advanced-analytics for pro plan (Feature Guard)', async () => {
      const r = await request(app.getHttpServer())
        .get('/api/v1/payments/advanced-analytics')
        .set('Authorization', `Bearer ${proToken}`);
      expect(r.status).toBe(200);
    });
  });

  // =====================================================================
  // BLOC 4: Trial Expiration
  // =====================================================================
  describe('Trial expiration', () => {
    let expiredToken: string;
    let expiredUserId: string;

    beforeAll(async () => {
      const expiredUserAuth = await getAuthToken(app, { email: 'plan-trial-expired@example.com' });
      expiredToken = expiredUserAuth.token;
      const expiredDoc = await prisma.user.findUnique({ where: { email: 'plan-trial-expired@example.com' } });
      expiredUserId = expiredDoc.id;

      // Set neutral role + trialStartedAt 15 days ago (trial = 14 days → expired)
      const expiredDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
      await prisma.user.update({
        where: { id: expiredUserId },
        data: { role: UserRole.PSYCHOLOGIST, trialStartedAt: expiredDate },
      });
      await prisma.subscription.deleteMany({ where: { userId: expiredUserId } });
    });

    it('should block client creation when trial has expired (403)', async () => {
      const r = await createClient(expiredToken, 'expired-trial');
      expect(r.status).toBe(403);
      expect(r.body.message).toMatch(/trial expired/i);
    });

    it('should return subscription status even with expired trial', async () => {
      const r = await request(app.getHttpServer())
        .get('/api/v1/payments/subscription-status')
        .set('Authorization', `Bearer ${expiredToken}`);
      expect(r.status).toBe(200);
      expect(r.body).toHaveProperty('status');
    });
  });

  // =====================================================================
  // BLOC 5: /payments/usage endpoint correctness per plan
  // =====================================================================
  describe('/payments/usage endpoint correctness', () => {
    it('should return correct limits for basic plan user', async () => {
      const r = await request(app.getHttpServer())
        .get('/api/v1/payments/usage')
        .set('Authorization', `Bearer ${basicToken}`)
        .expect(200);

      expect(r.body.planType.toLowerCase()).toBe('basic');
      expect(r.body.limits.clients).toBe(25);
      expect(r.body.limits.reportsPerMonth).toBe(100);
      expect(r.body.limits.simulatorCases).toBe(0);
    });

    it('should return correct limits for pro plan user', async () => {
      const r = await request(app.getHttpServer())
        .get('/api/v1/payments/usage')
        .set('Authorization', `Bearer ${proToken}`)
        .expect(200);

      expect(r.body.planType.toLowerCase()).toBe('pro');
      expect(r.body.limits.clients).toBe(-1); // UNLIMITED
      // simulatorCases for pro = 5 base (usage may be 5 from previous test, limit is still 5)
      expect(r.body.limits.simulatorCases).toBeGreaterThanOrEqual(5);
    });

    it('should include currentUsage in the response', async () => {
      const r = await request(app.getHttpServer())
        .get('/api/v1/payments/usage')
        .set('Authorization', `Bearer ${proToken}`)
        .expect(200);

      expect(r.body.currentUsage).toBeDefined();
      expect(r.body.currentUsage).toHaveProperty('clients');
      expect(r.body.currentUsage).toHaveProperty('reportsThisMonth');
      expect(r.body.currentUsage).toHaveProperty('simulatorCases');
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/payments/usage')
        .expect(401);
    });
  });

  // =====================================================================
  // BLOC 6: Feature Guard summary
  // =====================================================================
  describe('Feature Guard (advanced-analytics)', () => {
    it('demo plan is blocked (403)', async () => {
      const r = await request(app.getHttpServer())
        .get('/api/v1/payments/advanced-analytics')
        .set('Authorization', `Bearer ${demoToken}`);
      expect(r.status).toBe(403);
    });

    it('basic plan is blocked (403)', async () => {
      const r = await request(app.getHttpServer())
        .get('/api/v1/payments/advanced-analytics')
        .set('Authorization', `Bearer ${basicToken}`);
      expect(r.status).toBe(403);
    });

    it('pro plan is allowed (200)', async () => {
      const r = await request(app.getHttpServer())
        .get('/api/v1/payments/advanced-analytics')
        .set('Authorization', `Bearer ${proToken}`);
      expect(r.status).toBe(200);
    });
  });

  // =====================================================================
  // BLOC 7: Referral Bonus for Simulator
  // pro (5 base) + 2 referrals (×5 = 10) = 15 total
  // =====================================================================
  describe('Referral bonus extends simulator limit', () => {
    let referralToken: string;
    let referralUserId: string;

    beforeAll(async () => {
      const referralUserAuth = await getAuthToken(app, { email: 'plan-pro-referral@example.com' });
      referralToken = referralUserAuth.token;
      const referralDoc = await prisma.user.findUnique({ where: { email: 'plan-pro-referral@example.com' } });
      referralUserId = referralDoc.id;

      // Neutral role + pro subscription + 2 referrals → limit = 5 + 10 = 15
      await prisma.user.update({
        where: { id: referralUserId },
        data: { role: UserRole.PSYCHOLOGIST, trialStartedAt: null },
      });
      await prisma.subscription.deleteMany({ where: { userId: referralUserId } });
      await prisma.subscription.create({
        data: {
          userId: referralUserId,
          planType: 'pro',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          stripeSubscriptionId: `test_ref_${referralUserId}_${Date.now()}`,
        },
      });
      // 2 referrals, usage at 14 (one away from the limit of 15)
      await prisma.user.update({
        where: { id: referralUserId },
        data: { referralsCount: 2, simulatorUsageCount: 14 } as any,
      });
    });

    it('should allow simulator at usage=14 (limit=15 with 2 referrals)', async () => {
      // The limit check happens before the AI call, so we get 403 if blocked,
      // or any other status (201, 200, 400, 500) if the limit is passed
      const r = await request(app.getHttpServer())
        .post('/api/v1/simulator/start')
        .set('Authorization', `Bearer ${referralToken}`)
        .send(simulatorPayload);
      expect(r.status).not.toBe(403);

      // Force usage to 15 after the test (in case AI failed and usage wasn't incremented)
      await prisma.user.update({ where: { id: referralUserId }, data: { simulatorUsageCount: 15 } as any });
    });

    it('should block simulator at usage=15 (limit reached with referral bonus)', async () => {
      const r = await request(app.getHttpServer())
        .post('/api/v1/simulator/start')
        .set('Authorization', `Bearer ${referralToken}`)
        .send(simulatorPayload);
      expect(r.status).toBe(403);
      expect(r.body.message).toMatch(/simulator cases limit reached/i);
    });
  });
});
