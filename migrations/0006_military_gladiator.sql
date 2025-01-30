CREATE TABLE "app_stats_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"total_users" integer NOT NULL,
	"total_books" integer NOT NULL,
	"total_borrowed_books" integer NOT NULL,
	"stats_recording_status" boolean DEFAULT false NOT NULL,
	CONSTRAINT "app_stats_records_id_unique" UNIQUE("id")
);
