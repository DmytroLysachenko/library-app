"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { borrowBook } from "@/lib/actions/book";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "@/lib/utils";

interface BorrowBookProps {
  bookId: string;
  userId: string;
  borrowingEligibility: {
    isEligible: boolean;
    message: string;
  };
}

const BorrowBook = ({
  bookId,
  userId,
  borrowingEligibility,
}: BorrowBookProps) => {
  const router = useRouter();
  const [borrowing, setBorrowing] = useState(false);

  const handleBorrow = async () => {
    if (!borrowingEligibility.isEligible) {
      toast({
        title: "Error",
        description: borrowingEligibility.message,
        variant: "destructive",
      });
    }
    setBorrowing(true);

    try {
      const result = await borrowBook({ userId, bookId });

      if (result.success) {
        toast({
          title: "Success",
          description: "Book borrowed successfully",
        });

        router.push(`/my-profile`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBorrowing(false);
    }
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          className={cn(
            "w-fit",
            borrowingEligibility.isEligible
              ? "cursor-pointer"
              : "cursor-not-allowed"
          )}
        >
          <Button
            className={"book-overview_btn"}
            onClick={handleBorrow}
            disabled={borrowing || !borrowingEligibility.isEligible}
          >
            <BookOpen size={20} />
            <p className="font-bebas-neue text-xl text-dark-100">Borrow book</p>
          </Button>
        </TooltipTrigger>

        <TooltipContent>
          <p
            className={cn(
              " text-lg",
              borrowingEligibility.isEligible
                ? "text-dark-100"
                : "text-[#FF6C6F]"
            )}
          >
            {borrowingEligibility.isEligible
              ? "Borrow book"
              : borrowingEligibility.message}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BorrowBook;
