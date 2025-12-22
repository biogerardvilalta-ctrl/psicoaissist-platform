-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dashboard_layout" JSONB,
ADD COLUMN     "hourly_rate" DOUBLE PRECISION NOT NULL DEFAULT 50.0;
