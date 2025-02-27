ALTER TABLE "borrow_records" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "borrow_records" ALTER COLUMN "created_at" DROP NOT NULL;