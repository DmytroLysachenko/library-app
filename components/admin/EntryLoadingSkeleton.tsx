import React from "react";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";

const EntryLoadingSkeleton = () => (
  <div className="mx-auto max-w-2xl">
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="flex items-start gap-4 py-4">
          {/* Cover thumbnail */}
          <Skeleton className="h-16 w-12 rounded-md" />

          <div className="flex-1 space-y-2">
            {/* Title */}
            <Skeleton className="h-4 w-60" />

            {/* Author • Category */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-40" />
              <span className="text-muted-foreground">•</span>
              <Skeleton className="h-3 w-28" />
            </div>

            {/* Bottom row: avatar/name on left, date on right */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default EntryLoadingSkeleton;
