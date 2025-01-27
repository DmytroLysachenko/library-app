import BooksTable from "@/components/admin/BooksTable";
import { Button } from "@/components/ui/button";
import { db } from "@/db/drizzle";
import { books } from "@/db/schema";
import { getSortingOrder } from "@/lib/utils";
import Link from "next/link";
import React from "react";

const Page = async () => {
  const allBooks = (await db
    .select()
    .from(books)
    .orderBy(getSortingOrder("createdAt"))) as Book[];

  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold"> All Books</h2>
        <Button
          className="bg-primary-admin"
          asChild
        >
          <Link
            href={"/admin/books/new"}
            className="text-white"
          >
            + Create new book
          </Link>
        </Button>
      </div>
      <BooksTable books={allBooks} />
    </section>
  );
};

export default Page;
