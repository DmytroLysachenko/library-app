"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useEffect } from "react";

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
  const input = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const pathname = usePathname();

  const pushWithValue = (value: string) => {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(searchParam, value);
    else next.delete(searchParam);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  // Debounced change handler: runs 500ms after typing stops
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      pushWithValue(value);
      debounceTimer.current = null;
    }, 700);
  };

  // Clear button — also cancel any pending debounce
  const handleReset = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    if (input.current) {
      input.current.value = "";
      params.delete(searchParam);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
    onReset?.();
  };

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
        defaultValue={params.get(searchParam) || ""}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          variant === "user" && "search-input",
          variant === "admin" && "admin-search_input"
        )}
      />

      {input.current?.value && (
        <button
          onClick={handleReset}
          className={cn(
            "p-1 hover:opacity-70 transition-opacity",
            variant === "admin" && "mr-2"
          )}
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
