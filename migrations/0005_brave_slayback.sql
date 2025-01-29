ALTER TABLE "borrow_records" DROP CONSTRAINT "borrow_records_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "borrow_records" DROP CONSTRAINT "borrow_records_book_id_books_id_fk";
--> statement-breakpoint
ALTER TABLE "borrow_records" ADD CONSTRAINT "borrow_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "borrow_records" ADD CONSTRAINT "borrow_records_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;