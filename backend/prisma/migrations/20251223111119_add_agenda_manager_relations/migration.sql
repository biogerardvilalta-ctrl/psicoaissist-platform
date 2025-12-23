/*
  Warnings:

  - You are about to alter the column `hourly_rate` on the `users` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'AGENDA_MANAGER';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "created_by_id" TEXT,
ALTER COLUMN "hourly_rate" SET DEFAULT 60,
ALTER COLUMN "hourly_rate" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "_AgendaManagement" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AgendaManagement_AB_unique" ON "_AgendaManagement"("A", "B");

-- CreateIndex
CREATE INDEX "_AgendaManagement_B_index" ON "_AgendaManagement"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgendaManagement" ADD CONSTRAINT "_AgendaManagement_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgendaManagement" ADD CONSTRAINT "_AgendaManagement_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
