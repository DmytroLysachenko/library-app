"use client";

import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "./ui/button";

const NotFoundSection = ({ query }: { query: string }) => {
  const router = useRouter();

  const handleClearSearch = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("query");
    return `/search?${params.toString()}`;
  };

  return (
    <section className="pb-20">
      <h2 className="font-semibold text-4xl text-light-100 mb-10">
        Search Result for <span className="text-light-200">{query}</span>
      </h2>
      <div id="not-found">
        <Image
          src="/images/no-books.png"
          alt="no books"
          width={300}
          height={300}
        />
        <h4>No Results Found</h4>
        <p>
          We couldn’t find any books matching your search. Try using different
          keywords or check for typos.
        </p>
        <Button
          className="not-found-btn"
          asChild
        >
          <Link href={`${handleClearSearch()}`}>Clear Search</Link>
        </Button>
      </div>
    </section>
  );
};

export default NotFoundSection;
