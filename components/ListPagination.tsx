"use client";

import React from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Pagination,
  PaginationContent,
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
  const isUser = variant === "user";
  const router = useRouter();
  const pathnameFromHook = usePathname();
  const pathname =
    pathnameFromHook ||
    (typeof window !== "undefined" ? window.location.pathname : "/");
  const searchParams = useSearchParams();
  const navigate = (nextUrl: string) => {
    router.push(nextUrl, { scroll: false });
  };
  const toPage = (page: number) => {
    const fromSearchParams = searchParams.toString();
    const params = new URLSearchParams(
      fromSearchParams ||
        (typeof window !== "undefined" ? window.location.search : "")
    );
    params.set("page", page.toString());
    const query = params.toString();
    return query ? `?${query}` : "?";
  };
  const pages = Array.from({ length: lastPage }, (_, index) => index + 1);
  const goToPage = (pageNumber: number) => {
    const nextUrl = toPage(pageNumber);
    navigate(nextUrl);
  };

  return (
    <Pagination
      id="pagination"
      className="mt-8"
      data-testid={`pagination-${variant}`}
    >
      <PaginationContent data-testid="pagination-content">
        <PaginationItem>
          <button
            type="button"
            className={cn(
              isUser ? "pagination-btn_dark" : "pagination-btn_light"
            )}
            onClick={() => goToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            data-testid="pagination-prev"
          >
            <ArrowLeftIcon className="size-4" />
          </button>
        </PaginationItem>

        {pages.map((pageNumber) => (
          <PaginationItem key={pageNumber}>
            {pageNumber === currentPage ? (
              <span
                className={cn(
                  "pagination-btn_light flex items-center justify-center relative after:content-[''] after:bg-primary-admin after:w-full after:h-1 after:absolute after:bottom-0",
                  !isUser && "after:bg-primary-admin"
                )}
                data-testid={`pagination-page-${pageNumber}`}
                aria-current="page"
              >
                {pageNumber}
              </span>
            ) : (
              <button
                type="button"
                className={cn(
                  isUser ? "pagination-btn_dark" : "pagination-btn_light"
                )}
                onClick={() => goToPage(pageNumber)}
                data-testid={`pagination-page-${pageNumber}`}
              >
                {pageNumber}
              </button>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <button
            type="button"
            className={cn(
              isUser ? "pagination-btn_dark" : "pagination-btn_light"
            )}
            onClick={() => goToPage(Math.min(lastPage, currentPage + 1))}
            disabled={currentPage === lastPage}
            aria-label="Next page"
            data-testid="pagination-next"
          >
            <ArrowRightIcon className="size-4" />
          </button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default ListPagination;
