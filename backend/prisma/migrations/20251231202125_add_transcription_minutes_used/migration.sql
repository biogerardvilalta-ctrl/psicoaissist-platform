/*
  Warnings:

  - A unique constraint covering the columns `[referral_code]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "google_event_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "branding_config" JSONB,
ADD COLUMN     "googleImportCalendar" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "referral_code" TEXT,
ADD COLUMN     "referral_credits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referrals_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referred_by" TEXT,
ADD COLUMN     "simulator_last_reset" TIMESTAMP(3),
ADD COLUMN     "simulator_minutes_used" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "simulator_usage_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "transcription_minutes_used" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "simulation_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patientName" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "scenario" TEXT,
    "empathyScore" INTEGER NOT NULL,
    "effectivenessScore" INTEGER NOT NULL,
    "professionalismScore" INTEGER NOT NULL,
    "feedbackMarkdown" TEXT NOT NULL,

    CONSTRAINT "simulation_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");

-- AddForeignKey
ALTER TABLE "simulation_reports" ADD CONSTRAINT "simulation_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
