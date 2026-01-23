-- Add missing is_pending_registration column
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_pending_registration" BOOLEAN NOT NULL DEFAULT false;
