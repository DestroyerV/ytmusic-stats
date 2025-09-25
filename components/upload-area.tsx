"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, File, Check, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";

interface UploadAreaProps {
  onUploadComplete?: (result: any) => void;
  onUploadStart?: () => void;
}

export function UploadArea() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const validateFile = (file: File): string | null => {
    // Check file type
    if (file.type !== "application/json") {
      return "Please upload a JSON file from your Google Takeout.";
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return "File size must be less than 10MB.";
    }

    // Check filename pattern (optional but helpful)
    const isWatchHistory =
      file.name.toLowerCase().includes("watch-history") ||
      file.name.toLowerCase().includes("history");

    if (!isWatchHistory) {
      toast.warning("Filename check", {
        description:
          "Make sure this is your watch-history.json file from Google Takeout.",
      });
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadStatus("uploading");
    setProgress(0);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("files", file);

      // Upload to our UploadThing endpoint
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      setUploadStatus("success");
      setProgress(100);

      toast.success("File uploaded successfully!", {
        description: "Your music history is now being processed.",
      });

      router.push("/dashboard?uploaded=true");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setErrorMessage("Upload failed. Please try again.");

      toast.error("Upload failed", {
        description: "Please try again or check your file format.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadedFile(file);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setUploadStatus("error");
      setErrorMessage(validationError);
      toast.error("Invalid file", {
        description: validationError,
      });
      return;
    }

    // Start upload
    await uploadFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "application/json": [".json"],
      },
      maxFiles: 1,
      maxSize: 10 * 1024 * 1024, // 10MB
      disabled: isUploading || uploadStatus === "success",
    });

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadStatus("idle");
    setProgress(0);
    setErrorMessage("");
  };

  const getDropzoneStyles = () => {
    if (isDragReject) return "border-destructive bg-destructive/10";
    if (isDragActive) return "border-foreground bg-muted/50";
    if (uploadStatus === "success") return "border-foreground bg-muted/20";
    if (uploadStatus === "error") return "border-destructive bg-destructive/10";
    return "hover:border-muted-foreground hover:bg-muted/30";
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case "success":
        return <Check className="h-8 w-8 sm:h-12 sm:w-12 text-foreground" />;
      case "error":
        return <X className="h-8 w-8 sm:h-12 sm:w-12 text-destructive" />;
      case "uploading":
        return (
          <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-foreground animate-pulse" />
        );
      default:
        return (
          <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
        );
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
            relative border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-12 text-center cursor-pointer
            transition-all duration-300 ${getDropzoneStyles()}
            ${
              isUploading || uploadStatus === "success"
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }
          `}
      >
        <input {...getInputProps()} />

        <div className="space-y-3 sm:space-y-4 flex justify-center items-center flex-col">
          {getStatusIcon()}

          <div>
            {uploadStatus === "idle" && !isDragActive && (
              <div>
                <p className="text-base sm:text-lg font-medium mb-2">
                  Drag & drop your JSON file here
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  or click to browse files from your computer
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                  <span>✓ JSON files only</span>
                  <span>✓ Max 10MB</span>
                  <span>✓ Watch history files</span>
                </div>
              </div>
            )}

            {isDragActive && !isDragReject && (
              <div>
                <p className="text-base sm:text-lg font-medium">
                  Drop your file here...
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Release to upload your music history
                </p>
              </div>
            )}

            {isDragReject && (
              <div>
                <p className="text-base sm:text-lg font-medium text-destructive">
                  Invalid file type
                </p>
                <p className="text-xs sm:text-sm text-destructive/80 mt-1">
                  Please upload a JSON file from your Google Takeout
                </p>
              </div>
            )}

            {uploadStatus === "uploading" && (
              <div>
                <p className="text-base sm:text-lg font-medium">
                  Uploading your file...
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Processing your music history data
                </p>
                <div className="mt-3 sm:mt-4 max-w-xs mx-auto">
                  <Progress value={progress} className="h-2 sm:h-2.5" />
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    {progress}% complete
                  </p>
                </div>
              </div>
            )}

            {uploadStatus === "success" && (
              <div>
                <p className="text-base sm:text-lg font-medium">
                  Upload successful! 🎉
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Your file is now being processed. You'll see your stats
                  shortly.
                </p>
              </div>
            )}

            {uploadStatus === "error" && (
              <div>
                <p className="text-base sm:text-lg font-medium text-destructive">
                  Upload failed
                </p>
                <p className="text-xs sm:text-sm text-destructive/80 mt-1 break-words">
                  {errorMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {uploadedFile && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 bg-muted/50 rounded-lg border"
          >
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <File className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium truncate">
                {uploadedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {uploadStatus === "error" && (
                <Button
                  onClick={resetUpload}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto min-h-[44px] sm:min-h-[36px]"
                >
                  Try Again
                </Button>
              )}

              {uploadStatus === "success" && (
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-background" />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
