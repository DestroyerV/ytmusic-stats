import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import connectDB from "@/lib/db/connect";
import { ApiResponse } from "@/lib/types/database";
import { UserStatsService } from "@/lib/services/user-stats";

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

    // Get user data using the new service
    const userData = await UserStatsService.getUserStats(session.user.id);

    if (!userData) {
      return NextResponse.json(
        { success: false, error: "No user data found" },
        { status: 404 },
      );
    }

    const response: ApiResponse = {
      success: true,
      data: userData,
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
