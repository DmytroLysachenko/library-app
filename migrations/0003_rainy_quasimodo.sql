ALTER TABLE "users" ADD COLUMN "avatar" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "borrowed_books" integer DEFAULT 0 NOT NULL;