ALTER TABLE "users" RENAME COLUMN "googleImportCalendar" TO "google_import_calendar";
ALTER TABLE "simulation_reports" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "simulation_reports" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "simulation_reports" RENAME COLUMN "patientName" TO "patient_name";
ALTER TABLE "simulation_reports" RENAME COLUMN "empathyScore" TO "empathy_score";
ALTER TABLE "simulation_reports" RENAME COLUMN "effectivenessScore" TO "effectiveness_score";
ALTER TABLE "simulation_reports" RENAME COLUMN "professionalismScore" TO "professionalism_score";
ALTER TABLE "simulation_reports" RENAME COLUMN "feedbackMarkdown" TO "feedback_markdown";
