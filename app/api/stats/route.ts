import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import connectDB from "@/lib/db/connect";
import { UserStats } from "@/lib/db/models/UserStats";
import { updateUserStats } from "@/lib/services/user-stats";
import type { ApiResponse, IUserStats } from "@/lib/types/database";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const userStats: IUserStats | null = await UserStats.findOne({
      userId: session.user.id,
    });

    if (!userStats) {
      return NextResponse.json(
        { success: false, error: "No user data found" },
        { status: 404 },
      );
    }

    const response: ApiResponse = {
      success: true,
      data: userStats,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error getting user stats:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/stats - Save user stats (from client-side processing)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Parse the stats from request body
    const stats: IUserStats = await request.json();

    // Validate required fields
    if (
      typeof stats.totalSongs !== "number" ||
      typeof stats.totalArtists !== "number" ||
      typeof stats.totalListens !== "number"
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid stats data" },
        { status: 400 },
      );
    }

    await connectDB();

    // Save the stats
    await updateUserStats(session.user.id, {
      ...stats,
      lastUpdated: new Date(),
    });

    const response: ApiResponse = {
      success: true,
      message: "Stats saved successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error saving user stats:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
