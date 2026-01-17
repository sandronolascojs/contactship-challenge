CREATE TYPE "lead_source" AS ENUM ('manual', 'external_api');
--> statement-breakpoint
CREATE TYPE "lead_status" AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');
--> statement-breakpoint
CREATE TYPE "sync_status" AS ENUM ('pending', 'in_progress', 'completed', 'failed');
--> statement-breakpoint
CREATE TABLE "persons" (
	"person_id" text PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"full_name" text NOT NULL,
	"phone" varchar(50),
	"address" jsonb,
	"date_of_birth" timestamp with time zone,
	"nationality" varchar(100),
	"gender" varchar(20),
	"picture_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"lead_id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"external_id" varchar(255),
	"email" varchar(255) NOT NULL,
	"source" "lead_source" DEFAULT 'manual' NOT NULL,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"metadata" jsonb,
	"synced_at" timestamp with time zone,
	"summary" text,
	"next_action" text,
	"summary_generated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_jobs" (
	"sync_job_id" text PRIMARY KEY NOT NULL,
	"status" "sync_status" DEFAULT 'pending' NOT NULL,
	"records_processed" integer DEFAULT 0,
	"records_created" integer DEFAULT 0,
	"records_skipped" integer DEFAULT 0,
	"errors" jsonb,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_job_leads" (
	"sync_job_id" text NOT NULL,
	"lead_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sync_job_leads_sync_job_id_lead_id_pk" PRIMARY KEY("sync_job_id","lead_id")
);
--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_person_id_persons_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("person_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_job_leads" ADD CONSTRAINT "sync_job_leads_sync_job_id_sync_jobs_sync_job_id_fk" FOREIGN KEY ("sync_job_id") REFERENCES "public"."sync_jobs"("sync_job_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_job_leads" ADD CONSTRAINT "sync_job_leads_lead_id_leads_lead_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("lead_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_persons_full_name" ON "persons" USING btree ("full_name");--> statement-breakpoint
CREATE INDEX "idx_persons_phone" ON "persons" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_leads_person_id" ON "leads" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "idx_leads_email" ON "leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_leads_external_id" ON "leads" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "idx_leads_source" ON "leads" USING btree ("source");--> statement-breakpoint
CREATE INDEX "idx_leads_status" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_sync_jobs_status" ON "sync_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_sync_jobs_created_at" ON "sync_jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_sync_job_leads_sync_job_id" ON "sync_job_leads" USING btree ("sync_job_id");--> statement-breakpoint
CREATE INDEX "idx_sync_job_leads_lead_id" ON "sync_job_leads" USING btree ("lead_id");