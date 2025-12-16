-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserStatus" ADD VALUE 'PENDING_REVIEW';
ALTER TYPE "UserStatus" ADD VALUE 'VALIDATED';
ALTER TYPE "UserStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "human_review_confirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "log_metadata" JSONB,
ADD COLUMN     "professional_signature" TEXT;

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "consent_signed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "consent_timestamp" TIMESTAMP(3),
ADD COLUMN     "consent_version" TEXT,
ADD COLUMN     "is_minor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "started_at" TIMESTAMP(3);
