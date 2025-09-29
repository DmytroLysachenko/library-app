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

export const getBooksSortingOrder = (sortValue?: string) => {
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

export const getBorrowRequestsFilterValue = (sortValue?: string) => {
  switch (sortValue) {
    case "pending":
      return "PENDING";
    case "borrowed":
      return "BORROWED";
    default:
      return "PENDING";
  }
};
export const getUsersFilterValue = (sortValue?: string) => {
  switch (sortValue) {
    case "pending":
      return "PENDING";
    case "approved":
      return "APPROVED";
    case "rejected":
      return "REJECTED";
    default:
      return "APPROVED";
  }
};

export const getUserStatusIcon = (
  status: "APPROVED" | "PENDING" | "REJECTED" | null
) => {
  switch (status) {
    case "APPROVED":
      return "/icons/verified.svg";
    case "REJECTED":
      return "/icons/warning.svg";
    default:
      return "/icons/clock.svg";
  }
};

export const getUserStatusLabel = (
  status: "APPROVED" | "PENDING" | "REJECTED" | null
) => {
  switch (status) {
    case "APPROVED":
      return "Verified Student";
    case "REJECTED":
      return "Account rejected, contact admin";
    default:
      return "Status Pending";
  }
};

export const getNextStatus = (currentStatus: string) => {
  switch (currentStatus) {
    case "PENDING":
      return "BORROWED";
    case "BORROWED":
      return "RETURNED";
    default:
      return null;
  }
};

export const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-500 text-white";
    case "APPROVED":
      return "bg-green-500 text-white";
    case "REJECTED":
      return "bg-red-500 text-white";
    default:
      return "bg-yellow-500 text-white";
  }
};
