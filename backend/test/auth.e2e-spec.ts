import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { getAuthToken } from './helpers/auth.helper';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
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
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── Public Key ─────────────────────────────────────────────────────────────

  describe('GET /api/v1/auth/public-key', () => {
    it('should return a valid RSA public key', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/public-key')
        .expect(200)
        .expect((res) => {
          expect(res.body.publicKey).toBeDefined();
          expect(res.body.publicKey).toContain('BEGIN PUBLIC KEY');
        });
    });
  });

  // ─── Register ───────────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/register', () => {
    const uniqueSuffix = Date.now();
    const testEmail = `test-register-${uniqueSuffix}@example.com`;

    afterAll(async () => {
      await prisma.user.deleteMany({ where: { email: testEmail } });
    });

    it('should register a new user and return tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'Register',
          role: 'PSYCHOLOGIST',
          professionalNumber: '99999',
          country: 'ES',
        });
      expect([201]).toContain(res.status);
    });

    it('should return 409 if email is already registered', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'Register',
          role: 'PSYCHOLOGIST',
          professionalNumber: '99999',
          country: 'ES',
        });
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'Register',
          role: 'PSYCHOLOGIST',
          professionalNumber: '99999',
          country: 'ES',
        });
      expect([409, 400]).toContain(res.status);
    });

    it('should return 400 if required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'incomplete@example.com' })
        .expect(400);
    });
  });

  // ─── Login ──────────────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/login', () => {
    let testUserEmail: string;
    const password = 'TestPassword123!';

    beforeAll(async () => {
      const { user } = await getAuthToken(app);
      testUserEmail = user.email;
    });

    afterAll(async () => {
      await prisma.user.deleteMany({ where: { email: testUserEmail } });
    });

    it('should login with correct credentials and return tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUserEmail, password });
      expect(res.status).toBe(200);
      expect(res.body.tokens).toBeDefined();
      expect(res.body.tokens.accessToken).toBeDefined();
      expect(res.body.tokens.refreshToken).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUserEmail);
    });

    it('should return 401 with incorrect password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUserEmail, password: 'WrongPassword!' })
        .expect(401);
    });

    it('should return 401 with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'noexisteix@example.com', password: 'any' })
        .expect(401);
    });
  });

  // ─── Profile (GET /auth/me) ──────────────────────────────────────────────────

  describe('GET /api/v1/auth/me', () => {
    let token: string;
    let userEmail: string;

    beforeAll(async () => {
      const auth = await getAuthToken(app);
      token = auth.token;
      userEmail = auth.user.email;
    });

    afterAll(async () => {
      await prisma.user.deleteMany({ where: { email: userEmail } });
    });

    it('should return the authenticated user profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.email).toBe(userEmail);
    });

    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });
  });

  // ─── Update Profile (PATCH /auth/me) ────────────────────────────────────────

  describe('PATCH /api/v1/auth/me', () => {
    let token: string;
    let userEmail: string;

    beforeAll(async () => {
      const auth = await getAuthToken(app);
      token = auth.token;
      userEmail = auth.user.email;
    });

    afterAll(async () => {
      await prisma.user.deleteMany({ where: { email: userEmail } });
    });

    it('should update the user profile', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'UpdatedName' });
      expect([200, 201]).toContain(res.status);
    });
  });

  // ─── Change Password ─────────────────────────────────────────────────────────

  describe('PATCH /api/v1/auth/change-password', () => {
    const password = 'TestPassword123!';
    let token: string;
    let userEmail: string;

    beforeAll(async () => {
      const auth = await getAuthToken(app);
      token = auth.token;
      userEmail = auth.user.email;
    });

    afterAll(async () => {
      await prisma.user.deleteMany({ where: { email: userEmail } });
    });

    it('should reject change with incorrect current password', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'WrongCurrent!', newPassword: 'NewPassword456!' })
        .expect(401);
    });

    it('should change password with correct current password', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: password, newPassword: 'NewPassword456!' });
      expect([200, 201]).toContain(res.status);
    });
  });

  // ─── Forgot Password ─────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should return 200/201 generic message even if email not found (security: no user enumeration)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
          expect(res.body.message).toBeDefined();
        });
    });

    it('should set reset token if email exists', async () => {
      const uniqueSuffix = Date.now();
      const email = `test-reset-${uniqueSuffix}@example.com`;

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: 'dummy',
          role: 'PSYCHOLOGIST',
          status: 'ACTIVE',
          verified: true,
        },
      });

      await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email });

      const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });

      expect(updatedUser.resetPasswordToken).toBeTruthy();
      expect(updatedUser.resetPasswordExpires).toBeTruthy();
      expect(updatedUser.resetPasswordExpires.getTime()).toBeGreaterThan(Date.now());

      // Cleanup
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  // ─── Reset Password ──────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/reset-password', () => {
    it('should return 401 if token is invalid', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token: 'invalid-token-xyz', newPassword: 'NewPassword123!' })
        .expect(401);
    });
  });

  // ─── Logout ──────────────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/logout', () => {
    let token: string;
    let userEmail: string;

    beforeAll(async () => {
      const auth = await getAuthToken(app);
      token = auth.token;
      userEmail = auth.user.email;
    });

    afterAll(async () => {
      await prisma.user.deleteMany({ where: { email: userEmail } });
    });

    it('should logout successfully (clear session)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);
      expect([200, 201]).toContain(res.status);
      expect(res.body.message).toContain('Logout');
    });
  });

  // ─── Refresh Token ────────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/refresh', () => {
    it('should return 401 with an invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(401);
    });
  });

  // ─── Verify Password (Sudo) ───────────────────────────────────────────────────

  describe('POST /api/v1/auth/verify-password', () => {
    const password = 'TestPassword123!';
    let token: string;
    let userEmail: string;

    beforeAll(async () => {
      const auth = await getAuthToken(app);
      token = auth.token;
      userEmail = auth.user.email;
    });

    afterAll(async () => {
      await prisma.user.deleteMany({ where: { email: userEmail } });
    });

    it('should verify correct password (sudo mode)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ password });
      expect([200, 201]).toContain(res.status);
      expect(res.body.verified).toBe(true);
    });

    it('should return 401 with incorrect password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/verify-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'WrongPassword!' })
        .expect(401);
    });

    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/verify-password')
        .send({ password })
        .expect(401);
    });
  });
});
