import React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const SingleBookCardSkeleton = () => (
  <Card className="bg-transparent border-none shadow-none w-48">
    <CardContent className="p-0 space-y-3">
      {/* Book Cover */}
      <Skeleton className="h-60 w-44 rounded-lg" />

      {/* Title (multi-line possibility) */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Category */}
      <Skeleton className="h-3 w-28" />
    </CardContent>
  </Card>
);

const ListBookCardsSkeleton = () => (
  <ul className="book-list">
    <SingleBookCardSkeleton />
    <SingleBookCardSkeleton />
    <SingleBookCardSkeleton />
    <SingleBookCardSkeleton />
  </ul>
);

export default ListBookCardsSkeleton;
