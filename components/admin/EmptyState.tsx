import React from "react";

import { Card } from "../ui/card";
import { BookCopyIcon } from "lucide-react";

const EmptyState = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <Card className="p-8 text-center">
      <BookCopyIcon className="mx-auto size-40 opacity-20 p-4 mb-2" />
      <h3 className="text-lg font-semibold text-dark-400 mb-1">{title}</h3>
      <p className="text-light-500">{description}</p>
    </Card>
  );
};

export default EmptyState;
