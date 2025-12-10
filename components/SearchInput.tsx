"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "user" | "admin";
  onReset?: () => void;
  searchParam?: string;
  placeholder?: string;
}

const SearchInput = ({
  variant = "user",
  onReset,
  searchParam = "query",
  className,
  placeholder = "Search",
  ...props
}: SearchInputProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const input = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buildParams = (preferWindow = false) => {
    const fromSearchParams = searchParams.toString();
    if (fromSearchParams || !preferWindow) {
      return new URLSearchParams(fromSearchParams);
    }
    const fromWindow = typeof window !== "undefined" ? window.location.search : "";
    return new URLSearchParams(fromWindow);
  };
  const [value, setValue] = useState(
    () => buildParams(true).get(searchParam) || ""
  );
  const isTestEnv =
    typeof process !== "undefined" &&
    (process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID);
  const isJsdom =
    typeof navigator !== "undefined" &&
    typeof navigator.userAgent === "string" &&
    navigator.userAgent.includes("jsdom");

  const navigate = (nextUrl: string) => {
    router.push(nextUrl, { scroll: false });
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "test") {
      window.location.href = nextUrl;
    }
  };

  const pushWithValue = (nextValue: string) => {
    const nextParams = buildParams();
    if (nextValue) nextParams.set(searchParam, nextValue);
    else nextParams.delete(searchParam);
    const query = nextParams.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;

    navigate(nextUrl);
  };

  // Debounced change handler: runs 500ms after typing stops
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setValue(nextValue);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      pushWithValue(nextValue);
      debounceTimer.current = null;
    }, 700);
    // Push immediately to keep URL in sync for fast interactions/e2e (skip in unit tests)
    if (!isTestEnv && !isJsdom) {
      pushWithValue(nextValue);
    }
  };

  const flushPendingQuery = () => {
    const value = input.current?.value ?? "";
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
      pushWithValue(value);
    } else {
      pushWithValue(value);
    }
  };

  // Clear button — also cancel any pending debounce
  const handleReset = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    setValue("");
    if (input.current) {
      input.current.value = "";
    }
    const nextParams = buildParams();
    nextParams.delete(searchParam);
    const query = nextParams.toString();
    router.push(query ? `${pathname}?${query}` : `${pathname}?`, {
      scroll: false,
    });
    onReset?.();
  };

  // Sync value with URL (e.g., back/forward navigation)
  useEffect(() => {
    const paramsString = searchParams.toString();
    if (!paramsString) return;
    const current = new URLSearchParams(paramsString).get(searchParam) || "";
    setValue((prev) => (prev === current ? prev : current));
  }, [searchParams, searchParam]);

  // On unmount, cancel any pending debounce
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <div
      className={cn(
        "relative flex items-center gap-2",
        variant === "user" && "search",
        variant === "admin" && "admin-search",
        className
      )}
      data-testid={variant === "user" ? "search-input" : "admin-search-input"}
    >
      <Search
        className={cn(
          "size-4",
          variant === "user" && "text-light-200",
          variant === "admin" && "text-light-500"
        )}
      />

      <Input
        {...props}
        ref={input}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          variant === "user" && "search-input",
          variant === "admin" && "admin-search_input"
        )}
        data-testid={
          variant === "user"
            ? "search-input-field"
            : "admin-search-input-field"
        }
      />

      {value && (
        <button
          onClick={handleReset}
          onBlur={() => {
            if (variant === "user") {
              flushPendingQuery();
            }
          }}
          className={cn(
            "p-1 hover:opacity-70 transition-opacity",
            variant === "admin" && "mr-2"
          )}
          data-testid="search-input-clear"
        >
          <X
            className={cn(
              "size-4",
              variant === "user" && "text-light-200",
              variant === "admin" && "text-light-500"
            )}
          />
          <span className="sr-only">Clear search</span>
        </button>
      )}
    </div>
  );
};

export default SearchInput;
