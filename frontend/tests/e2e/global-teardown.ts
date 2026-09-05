/**
 * Playwright Global Teardown
 *
 * Cleans up all E2E test users created during the test run.
 * Calls DELETE /admin/test-users (only available in non-production).
 * This prevents test data from polluting the shared backend database.
 */

import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'video.demo@psicoaissist.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'password123';

async function globalTeardown() {
  console.log('\n[E2E Teardown] Cleaning up test users from database...');

  try {
    // Login as admin
    const loginRes = await axios.post(`${BACKEND_URL}/api/v1/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    const token = loginRes.data?.tokens?.accessToken || loginRes.data?.accessToken;
    if (!token) {
      console.warn('[E2E Teardown] Could not obtain admin token, skipping cleanup.');
      return;
    }

    // Call the admin cleanup endpoint
    const cleanupRes = await axios.delete(`${BACKEND_URL}/api/v1/admin/test-users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`[E2E Teardown] ✅ Deleted ${cleanupRes.data?.deleted ?? 0} test users.`);
  } catch (err: any) {
    // Non-fatal: cleanup failure should not fail CI
    console.warn('[E2E Teardown] ⚠️  Cleanup failed (non-fatal):', err?.response?.data?.message || err?.message);
  }
}

export default globalTeardown;
