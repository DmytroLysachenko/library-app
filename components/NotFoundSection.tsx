"use client";

import Image from "next/image";
import React from "react";
import Link from "next/link";

import { Button } from "./ui/button";

const NotFoundSection = ({ query }: { query: string }) => {
  const params = new URLSearchParams(window.location.search);

  params.delete("query");

  const clearSearchLink = `/search?${params.toString()}`;

  return (
    <section
      className="pb-20"
      data-testid="search-not-found"
    >
      <h2
        className="font-semibold text-4xl text-light-100 mb-10"
        data-testid="search-not-found-heading"
      >
        Search Result for{" "}
        <span
          className="text-light-200"
          data-testid="search-not-found-query"
        >
          {query}
        </span>
      </h2>
      <div
        id="not-found"
        data-testid="search-not-found-content"
      >
        <Image
          src="/images/no-books.png"
          alt="no books"
          width={300}
          height={300}
        />
        <h4 data-testid="search-not-found-title">No Results Found</h4>
        <p data-testid="search-not-found-description">
          We couldn&apos;t find any books matching your search. Try using
          different keywords or check for typos.
        </p>
        <Button
          className="not-found-btn"
          asChild
        >
          <Link
            href={clearSearchLink}
            data-testid="search-not-found-clear"
          >
            Clear Search
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default NotFoundSection;
