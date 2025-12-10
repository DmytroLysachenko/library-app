"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

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
  const pathnameFromHook = usePathname();
  const pathname =
    pathnameFromHook ||
    (typeof window !== "undefined" ? window.location.pathname : "/");
  const getParams = useMemo(
    () => () => {
      const fromSearchParams = searchParams.toString();
      const source =
        fromSearchParams ||
        (typeof window !== "undefined" ? window.location.search : "");
      return new URLSearchParams(source);
    },
    [searchParams]
  );
  const [value, setValue] = useState(searchParams.get(param) || "");
  const testId = dataTestId ?? `sort-selector-${variant}-${param}`;
  const navigate = (nextUrl: string) => {
    router.push(nextUrl);
  };

  const lastParamsString = useRef<string>("");
  useEffect(() => {
    const paramsString = getParams().toString();
    if (paramsString === lastParamsString.current) return;
    lastParamsString.current = paramsString;
    const current = new URLSearchParams(paramsString).get(param) || "";
    setValue((prev) => (prev === current ? prev : current));
  }, [getParams, param]);

  const handleSort = (value: string) => {
    setValue(value);
    const params = getParams();
    params.set(param, value);
    const query = params.toString();
    const nextUrl = query ? `?${query}` : "?";
    navigate(nextUrl);
  };

  const handleReset = () => {
    setValue("");
    const params = getParams();
    params.delete(param);
    const query = params.toString();
    const nextUrl = query ? `?${query}` : "?";
    navigate(nextUrl);
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
          <SelectValue
            placeholder={placeholder}
            data-testid="select-value"
          />
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
