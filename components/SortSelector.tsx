"use client";

import React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sorts } from "@/constants";
import { useRouter } from "next/navigation";

const SortSelector = () => {
  const router = useRouter();

  const handleSorting = (
    sortValue: "oldest" | "newest" | "available" | "highestRated"
  ) => {
    const params = new URLSearchParams(window.location.search);
    params.set("sort", sortValue);

    router.push(`?${params.toString()}`);
  };

  return (
    <Select onValueChange={handleSorting}>
      <SelectTrigger className="select-trigger">
        <SelectValue placeholder="Sorted by" />
      </SelectTrigger>
      <SelectContent className="select-content">
        <SelectGroup>
          {sorts.map((sort) => (
            <SelectItem
              key={sort.value}
              value={sort.value}
              className="select-item"
            >
              {sort.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SortSelector;
