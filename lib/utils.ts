import { asc, desc } from "drizzle-orm";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { books } from "@/db/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export const getSortingOrder = (sortValue?: string) => {
  switch (sortValue) {
    case "oldest":
      return asc(books.createdAt);
    case "newest":
      return desc(books.createdAt);
    case "available":
      return desc(books.availableCopies);
    case "highestRated":
      return desc(books.rating);

    default:
      return desc(books.createdAt);
  }
};
