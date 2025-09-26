"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Search,
  BarChart3,
  Music,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProcessingStatus as IProcessingStatus } from "@/lib/types/database";

interface ProcessingStatusProps {
  historyId: string;
  onComplete?: () => void;
}

const stageIcons = {
  parsing: FileText,
  extracting: Search,
  processing: Loader2,
  "generating-stats": BarChart3,
  completed: CheckCircle,
};

const stageLabels = {
  parsing: "Parsing JSON file",
  extracting: "Extracting music entries",
  processing: "Processing songs",
  "generating-stats": "Generating statistics",
  completed: "Processing complete",
};

export function ProcessingStatus({
  historyId,
  onComplete,
}: ProcessingStatusProps) {
  if (!historyId || historyId === "undefined") {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Invalid history ID</p>
      </div>
    );
  }

  const [status, setStatus] = useState<IProcessingStatus | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  const pollStatus = async () => {
    if (!historyId || historyId === "undefined") {
      console.error("ProcessingStatus: Invalid historyId provided:", historyId);
      return;
    }

    try {
      const response = await fetch(`/api/process/status/${historyId}`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data);

        // Stop polling if completed or failed
        if (data.status === "completed" || data.status === "failed") {
          setIsPolling(false);
          if (data.status === "completed") {
            onComplete?.();
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch processing status:", error);
    }
  };

  useEffect(() => {
    if (!isPolling || !historyId || historyId === "undefined") return;

    // Initial fetch
    pollStatus();

    // Poll every 2 seconds
    const interval = setInterval(pollStatus, 2000);

    return () => clearInterval(interval);
  }, [historyId, isPolling]);

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "processing":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default" as const;
      case "failed":
        return "destructive" as const;
      case "processing":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  if (!status) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm sm:text-base">
              Loading processing status...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const IconComponent = status.stage ? stageIcons[status.stage] : Music;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Music className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base md:text-lg">
              Processing Your Music History
            </span>
          </CardTitle>
          <Badge
            variant={getStatusVariant(status.status)}
            className="text-xs sm:text-sm"
          >
            {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-medium">Overall Progress</span>
            <span>{Math.round(status.progress)}%</span>
          </div>
          <Progress value={status.progress} className="h-2 sm:h-2.5" />
        </div>

        {/* Current Stage */}
        <AnimatePresence mode="wait">
          <motion.div
            key={status.stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 p-3 sm:p-4 bg-accent rounded-lg"
          >
            <div
              className={`p-2 rounded-full ${getStatusColor(status.status)} flex-shrink-0`}
            >
              <IconComponent
                className={`h-4 w-4 ${
                  status.status === "processing" ? "animate-caret-blink" : ""
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm sm:text-base">
                {status.stage ? stageLabels[status.stage] : "Processing..."}
              </p>
              {status.currentEntry && status.totalEntries && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                  Processing entry {status.currentEntry.toLocaleString()} of{" "}
                  {status.totalEntries.toLocaleString()}
                </p>
              )}
            </div>
            {status.estimatedTimeRemaining &&
              status.estimatedTimeRemaining > 0 && (
                <div className="text-right text-xs sm:text-sm self-end sm:self-auto">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatTimeRemaining(status.estimatedTimeRemaining)}
                    </span>
                  </div>
                </div>
              )}
          </motion.div>
        </AnimatePresence>

        {/* Entry Progress (if available) */}
        {status.currentEntry && status.totalEntries && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="truncate">Entries Processed</span>
              <span className="ml-2 flex-shrink-0">
                {status.currentEntry.toLocaleString()} /{" "}
                {status.totalEntries.toLocaleString()}
              </span>
            </div>
            <Progress
              value={(status.currentEntry / status.totalEntries) * 100}
              className="h-1 sm:h-1.5"
            />
          </div>
        )}

        {/* Error Message */}
        {status.status === "failed" && status.errorMessage && (
          <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800">
              <XCircle className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">
                Processing Failed
              </span>
            </div>
            <p className="text-xs sm:text-sm text-red-700 mt-1 break-words">
              {status.errorMessage}
            </p>
          </div>
        )}

        {/* Success Message */}
        {status.status === "completed" && (
          <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">
                  Processing Complete!
                </span>
              </div>
              <Button
                onClick={() => (window.location.href = "/dashboard")}
                size="sm"
                className="w-full sm:w-auto min-h-[44px] sm:min-h-[36px]"
              >
                View Dashboard
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-green-700 mt-1">
              Your music statistics are ready to explore.
            </p>
          </div>
        )}

        {/* Processing Tips */}
        {status.status === "processing" && (
          <div className="text-xs sm:text-sm p-3 sm:p-4 rounded-lg bg-accent">
            <p className="font-medium mb-2">While you wait:</p>
            <ul className="space-y-1 sm:space-y-1.5">
              <li>• We're analyzing every song in your history</li>
              <li>• Estimating song durations using smart algorithms</li>
              <li>• Generating comprehensive listening statistics</li>
              <li>• This process may take a time for large files</li>
              <li className="break-words">
                • You can safely close this tab and return later to check
                progress
              </li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
