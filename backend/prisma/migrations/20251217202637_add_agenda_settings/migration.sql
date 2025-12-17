-- AlterTable
ALTER TABLE "users" ADD COLUMN     "buffer_time" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "default_duration" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "work_end_hour" TEXT NOT NULL DEFAULT '18:00',
ADD COLUMN     "work_start_hour" TEXT NOT NULL DEFAULT '09:00';
