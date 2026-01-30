-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "video_call_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "sessions_video_call_token_key" ON "sessions"("video_call_token");
