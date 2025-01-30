import React from "react";
import Link from "next/link";
import { eq } from "drizzle-orm";

import BookForm from "@/components/admin/BookForm";
import { Button } from "@/components/ui/button";
import { db } from "@/db/drizzle";
import { books } from "@/db/schema";

const Page = async ({ params }: { params: Promise<{ bookId: string }> }) => {
  const { bookId } = await params;

  if (!bookId) return null;

  const [book] = await db.select().from(books).where(eq(books.id, bookId));

  return (
    <>
      <Button
        asChild
        className="back-btn"
      >
        <Link href={"/admin/books"}>Go Back</Link>
      </Button>
      <section className="w-full max-w-2xl">
        <BookForm
          type="update"
          {...book}
        />
      </section>
    </>
  );
};

export default Page;
