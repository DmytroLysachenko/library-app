import React from "react";

import { Card } from "../ui/card";

const EmptyState = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto mb-4 size-16 rounded-full bg-light-300 flex items-center justify-center">
        <div className="size-12 rounded-full bg-white" />
      </div>
      <h3 className="text-lg font-semibold text-dark-400 mb-1">{title}</h3>
      <p className="text-light-500">{description}</p>
    </Card>
  );
};

export default EmptyState;
