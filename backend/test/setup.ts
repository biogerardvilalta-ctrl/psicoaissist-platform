import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import { join } from 'path';

export default async () => {
  console.log('\n[Test Setup] Loading .env.test and setting up test database...');
  
  // Load .env.test
  dotenv.config({ path: join(__dirname, '../.env.test') });
  
  process.env.NODE_ENV = 'test';
  
  try {
    console.log('[Test Setup] Pushing Prisma schema to test DB...');
    execSync('npx prisma db push --force-reset --accept-data-loss --skip-generate', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
      stdio: 'inherit',
    });
    console.log('[Test Setup] Database setup complete.');
  } catch (error) {
    console.error('[Test Setup] Failed to setup database:', error.message);
    process.exit(1);
  }
};
