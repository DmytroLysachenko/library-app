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

const BooksPagination = ({
  currentPage,
  lastPage,
}: {
  currentPage: number;
  lastPage: number;
}) => {
  const params = new URLSearchParams(window.location.search);
  const isLastPage = currentPage === lastPage;
  const toPage = (page: number) => {
    params.set("page", page.toString());
    return `/search?${params.toString()}`;
  };

  return (
    <Pagination id="pagination">
      <PaginationContent>
        <PaginationItem>
          {currentPage !== 1 && (
            <PaginationLink
              className="pagination-btn_dark"
              href={`${toPage(currentPage - 1)}`}
            >
              <ArrowBigLeft />
            </PaginationLink>
          )}
        </PaginationItem>
        <PaginationItem className="pagination-btn_light size-9 flex items-center justify-center">
          {currentPage}
        </PaginationItem>
        {lastPage - currentPage > 1 && (
          <PaginationItem>
            <PaginationEllipsis className="text-white rounded-md bg-dark-300 " />
          </PaginationItem>
        )}
        {!isLastPage && (
          <PaginationItem>
            <PaginationLink
              className="pagination-btn_dark "
              href={`${toPage(lastPage)}`}
            >
              {lastPage}
            </PaginationLink>
          </PaginationItem>
        )}
        {!isLastPage && (
          <PaginationItem>
            <PaginationLink
              className="pagination-btn_dark "
              href={`${toPage(currentPage + 1)}`}
            >
              <ArrowBigRight />
            </PaginationLink>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default BooksPagination;
