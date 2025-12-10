"use client";

import Image from "next/image";
import React, { useCallback, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "./ui/button";

const NotFoundSection = ({ query }: { query: string }) => {
  const pathnameFromHook = usePathname();
  const searchParams = useSearchParams();
  const basePath =
    pathnameFromHook ||
    (typeof window !== "undefined" ? window.location.pathname : "/search");
  const clearUrl = useMemo(() => {
    const params = new URLSearchParams(
      typeof window !== "undefined"
        ? window.location.search
        : searchParams.toString()
    );
    params.delete("query");
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : `${basePath}?`;
  }, [basePath, searchParams]);

  const handleClear = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.href = clearUrl;
    }
  }, [clearUrl]);

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
          data-testid="search-not-found-clear"
          asChild
        >
          <Link
            href={clearUrl}
            onClick={handleClear}
          >
            Clear Search
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default NotFoundSection;
