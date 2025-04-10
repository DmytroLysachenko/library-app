import React from "react";

import { Card } from "../ui/card";
import { BookCopyIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const EmptyState = ({
  title,
  description,
  containerStyle,
}: {
  title: string;
  description: string;
  containerStyle?: string;
}) => {
  return (
    <Card
      className={cn(
        "p-8 mt-4 text-center rounded-t-none bg-transparent border-none shadow-none",
        containerStyle
      )}
    >
      <BookCopyIcon className="mx-auto size-40 opacity-20 p-4 mb-2" />
      <h3 className="text-lg font-semibold text-dark-400 mb-1">{title}</h3>
      <p className="text-light-500">{description}</p>
    </Card>
  );
};

export default EmptyState;
