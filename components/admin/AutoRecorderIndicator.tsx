"use client";

import { Power } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { setStatsRecorderStatus } from "@/lib/admin/actions/statsRecords";
import { toast } from "@/lib/actions/hooks/use-toast";

interface AutoRecorderIndicatorProps {
  status: boolean;
}

export function AutoRecorderIndicator({ status }: AutoRecorderIndicatorProps) {
  const [isEnabled, setIsEnabled] = useState(status);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    const newState = !isEnabled;
    setIsLoading(true);
    try {
      await setStatsRecorderStatus(newState);

      setIsEnabled(newState);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-gray-100 bg-light-600 px-3 py-1.5">
              <div
                className={`size-2 rounded-full ${isEnabled ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
              />
              <span className="text-xs font-medium text-dark-400">
                Auto Recorder {isEnabled ? "On" : "Off"}
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              disabled={isLoading}
              className={`shrink-0 ${
                isEnabled
                  ? "text-green-500 hover:text-green-600"
                  : "text-red-500 hover:text-red-600"
              }`}
              onClick={handleToggle}
            >
              <Power className="size-4" />
              <span className="sr-only">
                {isEnabled ? "Turn off" : "Turn on"} auto recorder
              </span>
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            Click to {isEnabled ? "disable" : "enable"} auto stats recording
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
