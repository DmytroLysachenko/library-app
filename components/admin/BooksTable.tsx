"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { IKImage } from "imagekitio-next";
import config from "@/lib/config";
import dayjs from "dayjs";
import Link from "next/link";
import { deleteBook } from "@/lib/admin/actions/books";

const BooksTable = ({ books }: { books: Book[] }) => {
  return (
    <div className="mt-7 w-full overflow-hidden">
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-slate-100">
            <TableRow>
              <TableHead>Book Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-10">
                      <IKImage
                        urlEndpoint={config.env.imagekit.urlEndpoint}
                        path={book.coverUrl}
                        alt={book.title}
                        width={40}
                        height={60}
                        className="object-cover rounded"
                      />
                    </div>
                    <span className="font-medium">{book.title}</span>
                  </div>
                </TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.genre}</TableCell>
                <TableCell>
                  {dayjs(book.createdAt).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <Link
                        href={`/admin/books/edit/${book.id}`}
                        className="text-white"
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={async () => {
                        await deleteBook(book.id!);
                        window.location.reload();
                      }}
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
    </div>
  );
};

export default BooksTable;
