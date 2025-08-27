import React, { Suspense } from "react";
import { desc, eq, not } from "drizzle-orm";
import { Loader2 } from "lucide-react";

import { auth } from "@/auth";
import BookList from "@/components/BookList";
import BookOverview from "@/components/BookOverview";
import { db } from "@/db/drizzle";
import { books } from "@/db/schema";
import BookDetails from "@/components/BookDetails";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const [{ id }, session] = await Promise.all([params, auth()]);

  const bookDetailsPromise = db
    .select({
      summary: books.summary,
      videoUrl: books.videoUrl,
    })
    .from(books)
    .where(eq(books.id, id))
    .then((res) => res[0]);

  const bookPromise = db
    .select()
    .from(books)
    .where(eq(books.id, id))
    .limit(1)
    .then((res) => res[0]) as Promise<Book>;

  const latestBooksPromise = db
    .select()
    .from(books)
    .limit(6)
    .where(not(eq(books.id, id)))
    .orderBy(desc(books.createdAt))
    .then((res) => res) as Promise<Book[]>;

  return (
    <>
      <BookOverview
        bookPromise={bookPromise}
        userId={session?.user?.id as string}
      />
      <div className="book-details">
        <div className="flex-[1.5]">
          <Suspense fallback={<Loader2 className="animate-spin" />}>
            <BookDetails bookDetailsPromise={bookDetailsPromise} />
          </Suspense>

          <BookList
            title="Latest Books"
            booksPromise={latestBooksPromise}
            containerClassName="mt-20"
          />
        </div>
      </div>
    </>
  );
};

export default Page;
