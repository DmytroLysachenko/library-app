import React from "react";
import { desc } from "drizzle-orm";

import { auth } from "@/auth";
import BookList from "@/components/BookList";
import BookOverview from "@/components/BookOverview";
import { db } from "@/db/drizzle";
import { books } from "@/db/schema";

const Home = async () => {
  const session = await auth();

  const latestBooksPromise = db
    .select()
    .from(books)
    .limit(6)
    .orderBy(desc(books.createdAt))
    .then((res) => res.slice(1)) as Promise<Book[]>;

  const latestBookPromise = db
    .select()
    .from(books)
    .limit(1)
    .orderBy(desc(books.createdAt))
    .then((res) => res[0]) as Promise<Book>;

  return (
    <>
      <BookOverview
        latestBookPromise={latestBookPromise}
        userId={session?.user?.id as string}
      />

      <BookList
        title="Latest Books"
        booksPromise={latestBooksPromise}
      />
    </>
  );
};

export default Home;
