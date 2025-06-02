"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AutoRecorderIndicatorProps {
  status: boolean;
}

export const AutoRecorderIndicator = ({
  status,
}: AutoRecorderIndicatorProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 col-span-3 ml-auto w-fit">
            <div className="flex items-center gap-2 rounded-full border border-gray-100 bg-light-600 px-3 py-1.5">
              <div
                className={`size-2 rounded-full ${status ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
              />
              <span className="text-xs font-medium text-dark-400">
                Auto Statistics Recorder : {status ? "On" : "Off"}
              </span>
            </div>
          </div>
        </TooltipTrigger>

        <TooltipContent>
          <p>Auto stats recording is {status ? "On" : "Off"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AutoRecorderIndicator;
