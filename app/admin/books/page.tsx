import React from "react";
import Link from "next/link";
import { asc, desc } from "drizzle-orm";

import BooksTable from "@/components/admin/BooksTable";
import SortSelector from "@/components/admin/SortSelector";
import { Button } from "@/components/ui/button";
import { db } from "@/db/drizzle";
import { books } from "@/db/schema";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: string; sort: "asc" | "desc" }>;
}) => {
  const { page = 1, sort } = await searchParams;

  const allBooks = (await db
    .select()
    .from(books)
    .orderBy(sort === "asc" ? asc(books.title) : desc(books.title))) as Book[];

  return (
    <div className="admin-container">
      <section className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold"> All Books</h2>
        <div className="flex flex-row items-center gap-2">
          <SortSelector type="alphabetical" />
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
      </section>
      <BooksTable books={allBooks} />
    </div>
  );
};

export default Page;
