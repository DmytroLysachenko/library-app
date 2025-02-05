"use client";

import React from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

const ListPagination = ({
  currentPage,
  lastPage,
  variant = "user",
}: {
  currentPage: number;
  lastPage: number;
  variant?: "user" | "admin";
}) => {
  const isLastPage = currentPage === lastPage;
  const isUser = variant === "user";
  const router = useRouter();
  const toPage = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    return `?${params.toString()}`;
  };

  return (
    <Pagination
      id="pagination"
      className="mt-8"
    >
      <PaginationContent>
        <PaginationItem>
          {currentPage !== 1 && (
            <button
              className={cn(
                isUser ? "pagination-btn_dark" : "pagination-btn_light"
              )}
              onClick={() => {
                router.push(toPage(currentPage - 1), { scroll: false });
              }}
            >
              <ArrowLeftIcon className="size-4" />
            </button>
          )}
        </PaginationItem>
        <PaginationItem className="pagination-btn_light  flex items-center justify-center">
          {currentPage}
        </PaginationItem>
        {lastPage - currentPage > 1 && (
          <PaginationItem>
            <PaginationEllipsis
              className={cn(
                isUser
                  ? "text-white rounded-md bg-dark-300 "
                  : " rounded-md text-dark-300 "
              )}
            />
          </PaginationItem>
        )}
        {!isLastPage && (
          <PaginationItem>
            <button
              className={cn(
                isUser ? "pagination-btn_dark" : "pagination-btn_light"
              )}
              onClick={() => {
                router.push(toPage(lastPage), { scroll: false });
              }}
            >
              {lastPage}
            </button>
          </PaginationItem>
        )}
        {!isLastPage && (
          <PaginationItem>
            <button
              className={cn(
                isUser ? "pagination-btn_dark" : "pagination-btn_light"
              )}
              onClick={() => {
                router.push(toPage(currentPage + 1), { scroll: false });
              }}
            >
              <ArrowRightIcon className="size-4" />
            </button>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default ListPagination;
