"use client";

import React from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import { useRouter } from "next/navigation";

const BooksPagination = ({
  currentPage,
  lastPage,
}: {
  currentPage: number;
  lastPage: number;
}) => {
  const isLastPage = currentPage === lastPage;
  const router = useRouter();
  const toPage = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    return `/search?${params.toString()}`;
  };

  return (
    <Pagination id="pagination">
      <PaginationContent>
        <PaginationItem>
          {currentPage !== 1 && (
            <button
              className="pagination-btn_dark"
              onClick={() => {
                router.push(toPage(currentPage - 1));
              }}
            >
              <ArrowBigLeft />
            </button>
          )}
        </PaginationItem>
        <PaginationItem className="pagination-btn_light  flex items-center justify-center">
          {currentPage}
        </PaginationItem>
        {lastPage - currentPage > 1 && (
          <PaginationItem>
            <PaginationEllipsis className="text-white rounded-md bg-dark-300 " />
          </PaginationItem>
        )}
        {!isLastPage && (
          <PaginationItem>
            <button
              className="pagination-btn_dark"
              onClick={() => {
                router.push(toPage(lastPage));
              }}
            >
              {lastPage}
            </button>
          </PaginationItem>
        )}
        {!isLastPage && (
          <PaginationItem>
            <button
              className="pagination-btn_dark"
              onClick={() => {
                router.push(toPage(currentPage + 1));
              }}
            >
              <ArrowBigRight />
            </button>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default BooksPagination;
