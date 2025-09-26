import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { MusicHistory } from "@/lib/db/models";
import connectDB from "@/lib/db/connect";
import {
  IMusicHistory,
  ProcessingStatusResponse,
  ErrorResponse,
} from "@/lib/types/database";

/**
 * GET /api/process/status/latest
 *
 * Retrieves the latest processing status for the authenticated user's music history upload.
 *
 * @param request - The incoming request object
 * @returns Promise resolving to NextResponse with either ProcessingStatusResponse or ErrorResponse
 *
 * @throws {401} When user is not authenticated
 * @throws {404} When no processing history is found for the user
 * @throws {500} When an internal server error occurs
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<ProcessingStatusResponse | ErrorResponse>> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      const errorResponse: ErrorResponse = { error: "Unauthorized" };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    await connectDB();

    // Find the latest processing record for this user
    const latestProcess: IMusicHistory | null = await MusicHistory.findOne(
      { userId: session.user.id },
      {
        status: 1,
        progress: 1,
        errorMessage: 1,
        uploadedAt: 1,
      },
    ).sort({ uploadedAt: -1 });

    if (!latestProcess) {
      const errorResponse: ErrorResponse = {
        error: "No processing history found",
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const response: ProcessingStatusResponse = {
      processId: latestProcess._id.toString(),
      status: latestProcess.status,
      progress: latestProcess.progress || 0,
      error: latestProcess.errorMessage,
      createdAt: latestProcess.uploadedAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching latest processing status:", error);
    const errorResponse: ErrorResponse = { error: "Internal server error" };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
