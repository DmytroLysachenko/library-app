import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "../ui/button";
import BookStripe from "./BookStripe";

const RecentlyAddedBooksSection = ({
  recentBooks,
}: {
  recentBooks: Book[];
}) => {
  return (
    <section className="row-span-2">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-dark-400">
          Recently Added Books
        </h2>
        <Button
          variant="link"
          className="view-btn px-0"
          asChild
        >
          <Link href="/admin/books">View all</Link>
        </Button>
      </div>

      <div className="space-y-3">
        <Link
          href="/admin/books/new"
          className="add-new-book_btn"
        >
          <div>
            <Plus className="text-primary-admin" />
          </div>
          <p>Add New Book</p>
        </Link>

        {recentBooks.map((book) => (
          <BookStripe
            key={book.id}
            book={book}
          />
        ))}
      </div>
    </section>
  );
};

export default RecentlyAddedBooksSection;
