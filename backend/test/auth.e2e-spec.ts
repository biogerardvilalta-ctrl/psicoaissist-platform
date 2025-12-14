import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

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

  describe('/auth/register (POST)', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'PSYCHOLOGIST_BASIC',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(registerDto.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not register user with invalid email', async () => {
      const registerDto = {
        email: 'invalid-email',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'PSYCHOLOGIST_BASIC',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(400);
    });

    it('should not register user with weak password', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User',
        role: 'PSYCHOLOGIST_BASIC',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      // Register a user first
      const registerDto = {
        email: 'test-login@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'PSYCHOLOGIST_BASIC',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(201);
    });

    it('should login with valid credentials', async () => {
      const loginDto = {
        email: 'test-login@example.com',
        password: 'TestPassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');

      authToken = response.body.tokens.accessToken;
    });

    it('should not login with invalid credentials', async () => {
      const loginDto = {
        email: 'test-login@example.com',
        password: 'WrongPassword',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginDto)
        .expect(401);
    });

    it('should not login with non-existent email', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123!',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginDto)
        .expect(401);
    });
  });

  describe('/auth/me (GET)', () => {
    beforeEach(async () => {
      // Register and login to get token
      const registerDto = {
        email: 'test-me@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'PSYCHOLOGIST_BASIC',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(201);

      const loginDto = {
        email: 'test-me@example.com',
        password: 'TestPassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginDto)
        .expect(200);

      authToken = response.body.tokens.accessToken;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('firstName');
      expect(response.body).toHaveProperty('lastName');
      expect(response.body).toHaveProperty('role');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should not get user profile without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });

    it('should not get user profile with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});