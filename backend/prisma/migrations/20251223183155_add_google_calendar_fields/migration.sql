-- AlterTable
ALTER TABLE "users" ADD COLUMN     "google_calendar_id" TEXT,
ADD COLUMN     "google_refresh_token" TEXT,
ADD COLUMN     "google_watch_expiration" BIGINT,
ADD COLUMN     "google_watch_id" TEXT,
ADD COLUMN     "google_watch_resource_id" TEXT;
