-- AlterTable
ALTER TABLE "users" ADD COLUMN     "schedule_config" JSONB,
ALTER COLUMN "preferred_language" SET DEFAULT 'ca';
