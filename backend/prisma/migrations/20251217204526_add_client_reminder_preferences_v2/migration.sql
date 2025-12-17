-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "send_email_reminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "send_whatsapp_reminders" BOOLEAN NOT NULL DEFAULT true;
