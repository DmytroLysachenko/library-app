"use server";

import { db } from "@/db/drizzle";
import { books } from "@/db/schema";
import { eq } from "drizzle-orm";

export const createBook = async (params: BookParams) => {
  try {
    const newBook = await db
      .insert(books)
      .values({
        ...params,
        availableCopies: params.totalCopies,
      })
      .returning()
      .then((res) => res[0]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newBook)),
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occurred while creating the book",
    };
  }
};

export const editBook = async (bookId: string, params: BookParams) => {
  try {
    const previousBook = await db
      .select({
        totalCopies: books.totalCopies,
        availableCopies: books.availableCopies,
      })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1)
      .then((res) => res[0]);

    const totalCopiesDifference = params.totalCopies - previousBook.totalCopies;

    const newBook = await db
      .update(books)
      .set({
        ...params,
        availableCopies: previousBook.availableCopies + totalCopiesDifference,
      })
      .where(eq(books.id, bookId))
      .returning()
      .then((res) => res[0]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newBook)),
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occurred while editing the book",
    };
  }
};

export const deleteBook = async (bookId: string) => {
  try {
    await db.delete(books).where(eq(books.id, bookId));
    return {
      success: true,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occurred while deleting the book",
    };
  }
};
