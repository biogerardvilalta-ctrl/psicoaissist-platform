-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "agenda_manager_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "client_warning_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "extra_simulator_cases" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "extra_transcription_minutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "report_warning_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "simulator_warning_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "transcription_warning_sent" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "transcription_minutes_used" SET DEFAULT 0,
ALTER COLUMN "transcription_minutes_used" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
