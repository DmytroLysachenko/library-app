import React from "react";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import BookList from "@/components/BookList";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { db } from "@/db/drizzle";
import { books, borrowRecords, users } from "@/db/schema";
import { getInitials } from "@/lib/utils";
import Image from "next/image";

const page = async () => {
  const session = await auth();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session?.user?.id as string))
    .limit(1);

  console.log(user, session);

  const borrowedBooks = (await db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      genre: books.genre,
      rating: books.rating,
      coverUrl: books.coverUrl,
      coverColor: books.coverColor,
      description: books.description,
      totalCopies: books.totalCopies,
      availableCopies: books.availableCopies,
      videoUrl: books.videoUrl,
      summary: books.summary,
      createdAt: books.createdAt,
      borrowDate: borrowRecords.createdAt,
      dueDate: borrowRecords.dueDate,
      returnDate: borrowRecords.returnDate,
      status: borrowRecords.status,
    }) // Explicitly specify the fields from books
    .from(borrowRecords)
    .leftJoin(books, eq(borrowRecords.bookId, books.id))
    .where(eq(borrowRecords.userId, session?.user?.id as string))) as Book[];

  const isApproved = user.status === "APPROVED";

  return (
    <div className="flex flex-col md:flex-row justify-between gap-10">
      <section className="gradient-vertical p-5 rounded-lg w-full md:w-[calc(60%)]">
        <div className="flex gap-6">
          <Avatar>
            <AvatarFallback className="bg-amber-100 w-full">
              {getInitials(session?.user?.name || "IN")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white flex ">
              <Image
                src={isApproved ? "/icons/verified.svg" : "/icons/warning.svg"}
                alt="status"
                width={18}
                height={18}
              />
              {user.status === "APPROVED"
                ? "Verified Student"
                : "Status Pending"}
            </p>
            <p className="text-white">{user.fullName}</p>
            <p>{user.email}</p>
          </div>
        </div>
      </section>
      <BookList
        title="Borrowed Books"
        books={borrowedBooks}
      />
    </div>
  );
};

export default page;
