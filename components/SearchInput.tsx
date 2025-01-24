"use client";

import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import { SearchIcon, X } from "lucide-react";

import { Input } from "./ui/input";

const SearchInput = () => {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const params = new URLSearchParams(window.location.search);

  const handleReset = () => {
    if (input.current && input.current.value) {
      params.delete("filter");
      input.current.value = "";
      router.push(`/search?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <div className="search">
      <SearchIcon className="text-light-200" />

      <Input
        placeholder="Search..."
        name="search"
        id="search"
        defaultValue={params.get("filter") || ""}
        className="search-input"
        ref={input}
        onChange={(event) => {
          if (!event.target.value) {
            router.push(`/search`);
            return;
          } else {
            router.push(`/search?filter=${event.target.value}`);
          }
        }}
      />

      <button onClick={handleReset}>
        <X className="text-light-200" />
      </button>
    </div>
  );
};

export default SearchInput;
