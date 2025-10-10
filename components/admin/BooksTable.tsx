"use client";

import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { deleteBook } from "@/lib/admin/actions/books";
import BookCover from "../BookCover";
import { useRouter } from "next/navigation";

const BooksTable = ({
  books,
  isTestAccount,
}: {
  books: Book[];
  isTestAccount: boolean;
}) => {
  const router = useRouter();

  return (
    <div className="mt-7 w-full overflow-hidden rounded-md border">
      <Table data-testid="admin-books-table">
        <TableHeader className="bg-slate-100">
          <TableRow data-testid="admin-books-header-row">
            <TableHead data-testid="admin-books-header-title">Book Title</TableHead>

            <TableHead data-testid="admin-books-header-author">Author</TableHead>

            <TableHead data-testid="admin-books-header-genre">Genre</TableHead>

            <TableHead data-testid="admin-books-header-date">Date Created</TableHead>

            <TableHead className="text-center" data-testid="admin-books-header-action">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {books.map((book) => (
            <TableRow key={book.id} data-testid="admin-books-row">
              <TableCell data-testid="admin-books-cell-title">
                <div className="flex items-center gap-3" data-testid="admin-books-cell-title-content">
                  <BookCover
                    coverUrl={book.coverUrl}
                    variant="small"
                    coverColor={book.coverColor}
                  />

                  <span className="font-medium" data-testid="admin-books-title">
                    {book.title}
                  </span>
                </div>
              </TableCell>

              <TableCell data-testid="admin-books-cell-author">{book.author}</TableCell>

              <TableCell data-testid="admin-books-cell-genre">{book.genre}</TableCell>

              <TableCell data-testid="admin-books-cell-date">
                {dayjs(book.createdAt).format("DD/MM/YYYY")}
              </TableCell>

              <TableCell className="text-right" data-testid="admin-books-cell-actions">
                <div className="flex items-center justify-end gap-2" data-testid="admin-books-action-buttons">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                  >
                    <Link
                      href={`/admin/books/edit/${book.id}`}
                      className="text-white"
                      data-testid="admin-books-edit"
                    >
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={async () => {
                      if (isTestAccount) {
                        alert("You can't delete a book from a test account.");
                        return;
                      }
                      await deleteBook(book.id!);
                      router.refresh();
                    }}
                    data-testid="admin-books-delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BooksTable;
