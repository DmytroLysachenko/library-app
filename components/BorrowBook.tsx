"use client";

import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "./ui/button";
import { toast } from "@/lib/actions/hooks/use-toast";
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
          description:
            "Your borrow request sent successfully, book will appear in your profile soon!",
        });

        router.push(`/my-profile`);
      }
    } catch (error) {
      console.log(error);
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
            !borrowingEligibility.isEligible && "cursor-not-allowed"
          )}
          asChild
        >
          <div>
            <Button
              className={"book-overview_btn"}
              onClick={handleBorrow}
              disabled={borrowing || !borrowingEligibility.isEligible}
            >
              <BookOpen size={20} />

              <p className="font-bebas-neue text-xl text-dark-100">
                Borrow book
              </p>
            </Button>
          </div>
        </TooltipTrigger>

        {!borrowingEligibility.isEligible && (
          <TooltipContent>
            <p className={cn(" text-lg", "text-[#FF6C6F]")}>
              {borrowingEligibility.message}
            </p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default BorrowBook;
