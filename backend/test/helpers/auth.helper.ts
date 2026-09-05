import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export async function getAuthToken(app: INestApplication, userOverrides: any = {}): Promise<{ token: string; user: any; userId?: string }> {
  const uniqueSuffix = Date.now().toString() + Math.floor(Math.random() * 1000);
  const email = userOverrides.email || `test-user-${uniqueSuffix}@example.com`;
  const password = userOverrides.password || 'TestPassword123!';

  const registerDto = {
    email,
    password,
    firstName: userOverrides.firstName || 'Test',
    lastName: userOverrides.lastName || 'User',
    role: userOverrides.role || 'PSYCHOLOGIST_PRO',
    professionalNumber: userOverrides.professionalNumber || '12345',
    country: userOverrides.country || 'ES',
  };

  const registerResponse = await request(app.getHttpServer())
    .post('/api/v1/auth/register')
    .send(registerDto);
    
  if (registerResponse.status !== 201 && registerResponse.status !== 409) {
    console.error('Registration failed:', registerResponse.body);
  }

  // Force user verification for tests
  const { PrismaService } = require('../../src/common/prisma/prisma.service');
  const prismaService = app.get(PrismaService);
  await prismaService.user.updateMany({
    where: { email },
    data: { verified: true, status: 'ACTIVE' }
  });

  // Pot ser que ja existeixi, intentem fer login
  const loginResponse = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email, password });

  if (loginResponse.status !== 200 && loginResponse.status !== 201) {
    throw new Error(`Failed to authenticate user: ${JSON.stringify(loginResponse.body)}`);
  }

  return {
    token: loginResponse.body.tokens.accessToken,
    user: loginResponse.body.user,
    userId: loginResponse.body.user?.id,
  };
}
