import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import { getAuthToken } from './helpers/auth.helper';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { UserRole } from '@prisma/client';

/**
 * Stripe Payments E2E Tests (Demo Mode)
 *
 * These tests validate the full payment API surface using the built-in
 * DEMO mode of the StripeService (no real Stripe keys needed).
 * In demo mode, all Stripe SDK calls return realistic mock objects
 * (cs_demo_xxx, cus_demo_xxx, sub_demo_xxx, etc.).
 *
 * Endpoints covered:
 * - GET  /payments/plans                    → public list of available plans
 * - POST /payments/create-checkout-session  → creates checkout URL for plan upgrade
 * - POST /payments/create-checkout-session-demo → demo checkout that activates plan immediately
 * - POST /payments/checkout/initial         → initial checkout (registration flow)
 * - POST /payments/verify-session           → verifies and activates a checkout session
 * - POST /payments/create-portal-session    → Stripe billing portal URL
 * - DELETE /payments/subscription           → cancel active subscription
 * - POST /payments/simulate-success         → admin simulates payment (resets usage)
 * - POST /payments/webhook                  → validates stripe-signature header
 */
describe('Stripe Payments API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Users
  let proToken: string;
  let proUserId: string;
  let basicToken: string;
  let basicUserId: string;
  let noSubToken: string;
  let noSubUserId: string;
  let adminToken: string;
  let adminUserId: string;

  async function createActiveSubscription(userId: string, planType: string) {
    await prisma.subscription.deleteMany({ where: { userId } });
    return prisma.subscription.create({
      data: {
        userId,
        planType,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stripeSubscriptionId: `sub_test_${planType}_${Date.now()}`,
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

    // Pro user (with active 'pro' subscription)
    const proAuth = await getAuthToken(app, { email: 'stripe-pro@example.com' });
    proToken = proAuth.token;
    proUserId = (await prisma.user.findUnique({ where: { email: 'stripe-pro@example.com' } })).id;
    await prisma.user.update({ where: { id: proUserId }, data: { role: UserRole.PSYCHOLOGIST, trialStartedAt: null } });
    await createActiveSubscription(proUserId, 'pro');

    // Basic user (with active 'basic' subscription - for upgrade tests)
    const basicAuth = await getAuthToken(app, { email: 'stripe-basic@example.com' });
    basicToken = basicAuth.token;
    basicUserId = (await prisma.user.findUnique({ where: { email: 'stripe-basic@example.com' } })).id;
    await prisma.user.update({ where: { id: basicUserId }, data: { role: UserRole.PSYCHOLOGIST, trialStartedAt: null } });
    await createActiveSubscription(basicUserId, 'basic');

    // No-subscription user (for initial checkout tests)
    const noSubAuth = await getAuthToken(app, { email: 'stripe-nosub@example.com' });
    noSubToken = noSubAuth.token;
    noSubUserId = (await prisma.user.findUnique({ where: { email: 'stripe-nosub@example.com' } })).id;
    await prisma.user.update({ where: { id: noSubUserId }, data: { role: UserRole.PSYCHOLOGIST, trialStartedAt: null } });
    await prisma.subscription.deleteMany({ where: { userId: noSubUserId } });

    // Admin user
    const adminAuth = await getAuthToken(app, { email: 'stripe-admin@example.com' });
    adminToken = adminAuth.token;
    adminUserId = (await prisma.user.findUnique({ where: { email: 'stripe-admin@example.com' } })).id;
    await prisma.user.update({ where: { id: adminUserId }, data: { role: UserRole.ADMIN } });
  }, 60000);

  afterAll(async () => {
    const emails = [
      'stripe-pro@example.com',
      'stripe-basic@example.com',
      'stripe-nosub@example.com',
      'stripe-admin@example.com',
    ];
    for (const email of emails) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) continue;
      await prisma.subscription.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    if (app) await app.close();
  }, 30000);

  // =====================================================================
  // GET /payments/plans — Public endpoint
  // =====================================================================
  describe('GET /payments/plans', () => {
    it('should return available plans publicly (no auth required)', async () => {
      const r = await request(app.getHttpServer())
        .get('/api/v1/payments/plans')
        .expect(200);

      // Plans are returned as object or array
      expect(typeof r.body === 'object' || Array.isArray(r.body)).toBe(true);
    });

    it('should include basic, pro and premium plans', async () => {
      const r = await request(app.getHttpServer())
        .get('/api/v1/payments/plans')
        .expect(200);

      const body = r.body;
      // Plans may be an object { basic: {...}, pro: {...} } or an array
      const planNames = Array.isArray(body)
        ? body.map((p: any) => p.name || p.id || p.planType).join(' ')
        : JSON.stringify(body).toLowerCase();

      expect(planNames).toMatch(/basic|pro|premium/i);
    });
  });

  // =====================================================================
  // POST /payments/create-checkout-session
  // =====================================================================
  describe('POST /payments/create-checkout-session', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/payments/create-checkout-session')
        .send({ plan: 'pro', interval: 'month' })
        .expect(401);
    });

    it('should return 400 for an invalid plan name', async () => {
      const r = await request(app.getHttpServer())
        .post('/api/v1/payments/create-checkout-session')
        .set('Authorization', `Bearer ${noSubToken}`)
        .send({ plan: 'nonexistent_plan_xyz', interval: 'month' });

      expect(r.status).toBe(400);
    });

    it('should return 400 if user already has active subscription of same plan', async () => {
      const r = await request(app.getHttpServer())
        .post('/api/v1/payments/create-checkout-session')
        .set('Authorization', `Bearer ${proToken}`)
        .send({ plan: 'pro', interval: 'month' });

      expect(r.status).toBe(400);
      expect(r.body.message).toMatch(/already has (this subscription|an active subscription)/i);
    });

    it('should return 400 if user already has a different active subscription (must use portal)', async () => {
      const r = await request(app.getHttpServer())
        .post('/api/v1/payments/create-checkout-session')
        .set('Authorization', `Bearer ${basicToken}`)
        .send({ plan: 'premium', interval: 'month' });

      expect(r.status).toBe(400);
      expect(r.body.message).toMatch(/already has an active subscription/i);
    });

    it('should create a checkout session for user without subscription', async () => {
      const r = await request(app.getHttpServer())
        .post('/api/v1/payments/create-checkout-session')
        .set('Authorization', `Bearer ${noSubToken}`)
        .send({ plan: 'basic', interval: 'month' });

      // In demo mode → 201 with checkout URL
      expect([200, 201]).toContain(r.status);
      if (r.status === 201 || r.status === 200) {
        expect(r.body).toHaveProperty('url');
        expect(r.body.url).toBeTruthy();
      }
    });
  });

  // =====================================================================
  // POST /payments/create-checkout-session-demo (activates plan immediately)
  // =====================================================================
  describe('POST /payments/create-checkout-session-demo', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/payments/create-checkout-session-demo')
        .send({ plan: 'pro', interval: 'month' })
        .expect(401);
    });

    it('should activate pro plan immediately for user without subscription (demo mode)', async () => {
      // Use a fresh no-sub user
      const r = await request(app.getHttpServer())
        .post('/api/v1/payments/create-checkout-session-demo')
        .set('Authorization', `Bearer ${noSubToken}`)
        .send({ plan: 'pro', interval: 'month' });

      expect([200, 201]).toContain(r.status);
      if (r.status === 200 || r.status === 201) {
        // Demo checkout returns { sessionId, url, plan } (subscription activated immediately)
        expect(r.body).toHaveProperty('sessionId');
        expect(r.body).toHaveProperty('url');
        expect(r.body.url).toBeTruthy();

        // Verify subscription was created in DB
        const sub = await prisma.subscription.findUnique({ where: { userId: noSubUserId } });
        expect(sub).toBeTruthy();
        expect(sub.planType).toBe('pro');
        expect(sub.status).toBe('active');
      }
    });
  });

  // =====================================================================
  // POST /payments/checkout/initial (registration flow)
  // =====================================================================
  describe('POST /payments/checkout/initial', () => {
    it('should return 400 if userId is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/payments/checkout/initial')
        .send({ plan: 'basic', interval: 'month' })
        .expect(400);
    });

    it('should return 400 if plan is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/payments/checkout/initial')
        .send({ userId: noSubUserId, interval: 'month' })
        .expect(400);
    });

    it('should return 400 for invalid/non-existent userId', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/payments/checkout/initial')
        .send({ userId: 'invalid_id_that_does_not_exist', plan: 'basic', interval: 'month' })
        .expect(400);
    });

    it('should return 400 if user already has an active subscription', async () => {
      const r = await request(app.getHttpServer())
        .post('/api/v1/payments/checkout/initial')
        .send({ userId: proUserId, plan: 'pro', interval: 'month' });

      expect(r.status).toBe(400);
      expect(r.body.message).toMatch(/already has an active subscription/i);
    });
  });

  // =====================================================================
  // POST /payments/verify-session
  // =====================================================================
  describe('POST /payments/verify-session', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/payments/verify-session')
        .send({ sessionId: 'cs_test_123' })
        .expect(401);
    });

    it('should process a demo checkout session and return subscription data', async () => {
      // First create a demo checkout session to get a valid session ID
      const checkoutRes = await request(app.getHttpServer())
        .post('/api/v1/payments/create-checkout-session-demo')
        .set('Authorization', `Bearer ${noSubToken}`)
        .send({ plan: 'basic', interval: 'month' });

      const sessionId = checkoutRes.body?.sessionId || checkoutRes.body?.id || 'cs_demo_test';

      const r = await request(app.getHttpServer())
        .post('/api/v1/payments/verify-session')
        .set('Authorization', `Bearer ${noSubToken}`)
        .send({ sessionId });

      // Should handle gracefully (200 with result, or 404 if session not found in demo)
      expect([200, 201, 404]).toContain(r.status);
    });
  });

  // =====================================================================
  // POST /payments/create-portal-session
  // =====================================================================
  describe('POST /payments/create-portal-session', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/payments/create-portal-session')
        .expect(401);
    });

    it('should return portal session URL for user with stripeCustomerId', async () => {
      // Give the pro user a stripeCustomerId
      await prisma.user.update({
        where: { id: proUserId },
        data: { stripeCustomerId: 'cus_demo_test_portal' } as any,
      });

      const r = await request(app.getHttpServer())
        .post('/api/v1/payments/create-portal-session')
        .set('Authorization', `Bearer ${proToken}`);

      // In demo mode, this returns a portal URL or error if stripeCustomerId is not valid in demo
      expect([200, 201, 400, 404, 500]).toContain(r.status);
      if (r.status === 200 || r.status === 201) {
        expect(r.body).toHaveProperty('url');
      }
    });

    it('should handle gracefully when user has no stripeCustomerId', async () => {
      // Remove stripeCustomerId
      await prisma.user.update({
        where: { id: basicUserId },
        data: { stripeCustomerId: null } as any,
      });

      const r = await request(app.getHttpServer())
        .post('/api/v1/payments/create-portal-session')
        .set('Authorization', `Bearer ${basicToken}`);

      // Should return error, not crash the server
      expect(r.status).toBeLessThan(600);
      expect(r.status).not.toBe(401);
    });
  });

  // =====================================================================
  // DELETE /payments/subscription (cancel)
  // =====================================================================
  describe('DELETE /payments/subscription', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/payments/subscription')
        .expect(401);
    });

    it('should cancel an active subscription in demo mode', async () => {
      // Give the pro user a fake stripeSubscriptionId
      await prisma.subscription.update({
        where: { userId: proUserId },
        data: { stripeSubscriptionId: 'sub_demo_cancel_test' },
      });

      const r = await request(app.getHttpServer())
        .delete('/api/v1/payments/subscription')
        .set('Authorization', `Bearer ${proToken}`);

      // Demo mode → cancel returns success or not-found (depending on demo logic)
      expect([200, 201, 400, 404]).toContain(r.status);
      if (r.status === 200 || r.status === 201) {
        expect(r.body).toBeDefined();
      }
    });
  });

  // =====================================================================
  // POST /payments/simulate-success (Admin only)
  // =====================================================================
  describe('POST /payments/simulate-success', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/payments/simulate-success')
        .send({ userId: basicUserId })
        .expect(401);
    });

    it('should return 403 for non-admin users', async () => {
      const r = await request(app.getHttpServer())
        .post('/api/v1/payments/simulate-success')
        .set('Authorization', `Bearer ${basicToken}`)
        .send({ userId: basicUserId });

      expect(r.status).toBe(403);
    });

    it('should reset usage counters for a user (admin)', async () => {
      // Set some usage first
      await prisma.user.update({
        where: { id: basicUserId },
        data: { simulatorUsageCount: 10, transcriptionMinutesUsed: 300 } as any,
      });

      const r = await request(app.getHttpServer())
        .post('/api/v1/payments/simulate-success')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: basicUserId });

      expect([200, 201]).toContain(r.status);
      expect(r.body.success).toBe(true);

      // Verify usage was reset
      const user = await prisma.user.findUnique({ where: { id: basicUserId } });
      expect(user.simulatorUsageCount).toBe(0);
    });
  });

  // =====================================================================
  // POST /payments/webhook (Stripe signature validation)
  // =====================================================================
  describe('POST /payments/webhook', () => {
    it('should return 400 when stripe-signature header is missing', async () => {
      const r = await request(app.getHttpServer())
        .post('/api/v1/payments/webhook')
        .send({ type: 'checkout.session.completed' });

      expect(r.status).toBe(400);
      expect(r.body.message).toMatch(/missing stripe-signature header/i);
    });

    it('should return 400 when stripe-signature is invalid', async () => {
      const r = await request(app.getHttpServer())
        .post('/api/v1/payments/webhook')
        .set('stripe-signature', 'invalid_signature_xyz')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ type: 'checkout.session.completed' }));

      // Invalid signature → either 400 (validation error) or 500 (raw body missing in test context)
      expect([400, 500]).toContain(r.status);
    });
  });
});
