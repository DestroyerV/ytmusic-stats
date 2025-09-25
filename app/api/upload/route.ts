import { auth } from "@/lib/auth/config";
import connectDB from "@/lib/db/connect";
import { MusicHistory, HistoryEntry, UserStats } from "@/lib/db/models";
import { inngest } from "@/lib/inngest/client";
import { UserStatsService } from "@/lib/services/user-stats";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

// Function to clean up all existing user data
async function cleanupUserData(userId: string) {
  try {
    // Get all existing music histories for this user
    const existingHistories = await UserStatsService.getUserMusicHistories(
      userId
    );

    if (existingHistories.length > 0) {
      // Delete all history entries for these histories
      await HistoryEntry.deleteMany({
        historyId: { $in: existingHistories },
      });

      // Delete all music history records
      await MusicHistory.deleteMany({
        _id: { $in: existingHistories },
      });

      // Clear user music histories associations
      await UserStatsService.clearUserMusicHistories(userId);

      // Reset user stats
      await UserStats.deleteOne({ userId });

      console.log(
        `Cleaned up existing data for user ${userId}: ${existingHistories.length} histories`
      );
    }
  } catch (error) {
    console.error("Error cleaning up user data:", error);
    // Don't fail the upload if cleanup fails, just log the error
  }
}

// File validation function
function validateFile(file: File): string | null {
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
    console.warn(
      "Filename check: Make sure this is your watch-history.json file from Google Takeout."
    );
  }

  return null;
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("files") as File | null;

  if (!file) {
    return NextResponse.json(
      { success: false, error: "No file uploaded" },
      { status: 400 }
    );
  }

  // Validate the uploaded file
  const validationError = validateFile(file);
  if (validationError) {
    return NextResponse.json(
      { success: false, error: validationError },
      { status: 400 }
    );
  }

  // Read file content
  const fileContent = await file.text();

  // Validate JSON content
  let parsedContent;
  try {
    parsedContent = JSON.parse(fileContent);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Invalid JSON file. Please ensure the file is a valid JSON from Google Takeout.",
      },
      { status: 400 }
    );
  }

  // Basic structure validation for YouTube watch history
  if (!Array.isArray(parsedContent)) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Invalid file format. Expected an array of watch history entries.",
      },
      { status: 400 }
    );
  }

  // Check if the array has some entries and they have the expected structure
  if (parsedContent.length > 0) {
    const firstEntry = parsedContent[0];
    if (!firstEntry.title && !firstEntry.titleUrl && !firstEntry.time) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid watch history format. This doesn't appear to be a YouTube watch history file.",
        },
        { status: 400 }
      );
    }
  }

  // Create music history record and clean up old data
  await connectDB();

  // First, clean up all existing data for this user
  await cleanupUserData(session.user.id);

  const musicHistory = await MusicHistory.create({
    userId: session.user.id,
    fileName: file.name,
    fileSize: file.size,
    status: "pending",
    fileContent, // Store file content in database
  });

  await UserStatsService.addMusicHistory(
    session.user.id,
    musicHistory._id.toString()
  );

  
  // Trigger Inngest function to process the uploaded file
  await inngest.send({
    name: "process/music-history",
    data: {
      userId: session.user.id,
      historyId: musicHistory._id.toString(),
      fileName: file.name,
      fileSize: file.size,
    },
  });
  
  return NextResponse.json({
    success: true,
    data: {
      uploadedBy: session.user.id,
      fileName: file.name,
      fileSize: file.size,
      historyId: musicHistory._id.toString(),
    },
  });
}
