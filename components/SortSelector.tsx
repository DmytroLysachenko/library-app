"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, X } from "lucide-react";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SortSelector = ({
  options,
  param,
  variant,
  placeholder = "Sort by",
  placeholderIcon = <ArrowUpDown className="mr-2 h-4 w-4" />,
  cancelButton = true,
  dataTestId,
}: {
  options: { value: string; title: string }[];
  param: string;
  variant: "admin" | "user";
  placeholder?: string;
  placeholderIcon?: React.ReactNode;
  cancelButton?: boolean;
  dataTestId?: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(param) || "");
  const testId = dataTestId ?? `sort-selector-${variant}-${param}`;

  const handleSort = (value: string) => {
    setValue(value);
    const params = new URLSearchParams(searchParams);
    params.set(param, value);
    router.push(`?${params.toString()}`);
  };

  const handleReset = () => {
    setValue("");
    const params = new URLSearchParams(searchParams);
    params.delete(param);
    router.push(`?${params.toString()}`);
  };
  const isUser = variant === "user";

  return (
    <div className="flex gap-2 items-center">
      <Select
        value={value}
        onValueChange={handleSort}
      >
        <SelectTrigger
          className={cn(isUser ? "select-trigger" : "w-fit")}
          data-testid={testId}
        >
          {!isUser && placeholderIcon}
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className={cn(isUser && "select-content")}>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={cn(isUser && "select-item")}
              data-testid={`${testId}-option-${option.value}`}
            >
              {option.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {cancelButton && (
        <button
          type="button"
          onClick={handleReset}
          data-testid={`${testId}-reset`}
        >
          <X className=" size-4 text-red-400" />
        </button>
      )}
    </div>
  );
};

export default SortSelector;
