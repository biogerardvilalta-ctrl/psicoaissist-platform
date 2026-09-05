/**
 * E2E Test Configuration
 * Central place to define the backend URL used by all E2E tests.
 * 
 * Always points to localhost:3001 (local backend).
 * NEVER points to Hetzner/production.
 */
export const BACKEND_URL = process.env.E2E_BACKEND_URL || 'http://localhost:3001';
export const API_URL = `${BACKEND_URL}/api/v1`;
