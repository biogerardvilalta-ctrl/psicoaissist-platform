-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PSYCHOLOGIST_BASIC', 'PSYCHOLOGIST_PRO', 'PSYCHOLOGIST_PREMIUM', 'PSYCHOLOGIST', 'STUDENT', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('AUDIO_RECORDING', 'AI_PROCESSING', 'DATA_STORAGE', 'THIRD_PARTY_SHARING', 'MARKETING_COMMUNICATIONS');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('INDIVIDUAL', 'GROUP', 'FAMILY', 'COUPLE', 'CONSULTATION', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "AudioQuality" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'ULTRA');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('INITIAL_EVALUATION', 'PROGRESS', 'DISCHARGE', 'REFERRAL', 'LEGAL', 'INSURANCE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'COMPLETED', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'FAILED_LOGIN', 'PASSWORD_RESET', 'EMAIL_VERIFICATION', 'SUBSCRIPTION_CHANGE', 'DATA_EXPORT', 'DATA_IMPORT', 'CONSENT_GRANTED', 'CONSENT_REVOKED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_token" TEXT,
    "reset_password_token" TEXT,
    "reset_password_expires" TIMESTAMP(3),
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "professional_number" TEXT,
    "speciality" TEXT,
    "stripe_customer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stripe_subscription_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "plan_type" TEXT NOT NULL,
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "canceled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encryption_keys" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "key_value" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL DEFAULT 'aes-256-gcm',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "encryption_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "encrypted_personal_data" BYTEA NOT NULL,
    "encrypted_clinical_data" BYTEA,
    "encrypted_sensitive_data" BYTEA,
    "tags" TEXT[],
    "risk_level" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "encryption_key_id" TEXT NOT NULL,
    "data_version" INTEGER NOT NULL DEFAULT 1,
    "first_session_at" TIMESTAMP(3),
    "last_session_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_modified_by" TEXT NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consents" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "consent_type" "ConsentType" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "version" TEXT NOT NULL DEFAULT '1.0',
    "notes" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "duration" INTEGER,
    "session_type" "SessionType" NOT NULL,
    "status" "SessionStatus" NOT NULL,
    "encrypted_transcription" BYTEA,
    "encrypted_notes" BYTEA,
    "encrypted_audio_path" TEXT,
    "ai_suggestions" JSONB,
    "ai_metadata" JSONB,
    "encryption_key_id" TEXT,
    "audio_quality" "AudioQuality",
    "recording_consent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT,
    "title" TEXT NOT NULL,
    "report_type" "ReportType" NOT NULL,
    "status" "ReportStatus" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "encrypted_content" BYTEA NOT NULL,
    "encrypted_metadata" BYTEA,
    "template_id" TEXT,
    "ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "ai_confidence" DOUBLE PRECISION,
    "encryption_key_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" "AuditAction" NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT,
    "method" TEXT,
    "url" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "metadata" JSONB,
    "is_success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "risk_score" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_customer_id_key" ON "users"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_plan_type_idx" ON "subscriptions"("plan_type");

-- CreateIndex
CREATE INDEX "encryption_keys_user_id_is_active_idx" ON "encryption_keys"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "clients_user_id_is_active_idx" ON "clients"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "clients_tags_idx" ON "clients"("tags");

-- CreateIndex
CREATE INDEX "clients_risk_level_idx" ON "clients"("risk_level");

-- CreateIndex
CREATE INDEX "consents_client_id_consent_type_idx" ON "consents"("client_id", "consent_type");

-- CreateIndex
CREATE INDEX "sessions_user_id_status_idx" ON "sessions"("user_id", "status");

-- CreateIndex
CREATE INDEX "sessions_client_id_start_time_idx" ON "sessions"("client_id", "start_time");

-- CreateIndex
CREATE INDEX "reports_user_id_status_idx" ON "reports"("user_id", "status");

-- CreateIndex
CREATE INDEX "reports_client_id_report_type_idx" ON "reports"("client_id", "report_type");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_resource_type_resource_id_idx" ON "audit_logs"("resource_type", "resource_id");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encryption_keys" ADD CONSTRAINT "encryption_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consents" ADD CONSTRAINT "consents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
