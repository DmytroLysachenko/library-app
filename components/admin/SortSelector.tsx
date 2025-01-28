"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SortSelector = ({ type }: { type: "alphabetical" | "date" }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isAlphabetical = type === "alphabetical";

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    router.push(`?${params.toString()}`);
  };

  return (
    <Select
      defaultValue={searchParams.get("sort") || "desc"}
      onValueChange={handleSort}
    >
      <SelectTrigger className="w-[180px]">
        <ArrowUpDown className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="desc">
          {isAlphabetical ? "Z to A" : "Recent to Oldest"}
        </SelectItem>
        <SelectItem value="asc">
          {isAlphabetical ? "A to Z" : "Oldest to Recent"}
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SortSelector;
