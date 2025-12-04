import connectDB from "@/lib/db/connect";
import type { IUserStats } from "@/lib/types/database";
import { UserStats } from "../db/models/UserStats";

/**
 * Update or create user stats
 */
export async function updateUserStats(
  userId: string,
  stats: IUserStats,
): Promise<void> {
  await connectDB();

  await UserStats.findOneAndUpdate(
    { userId },
    {
      userId,
      ...stats,
      lastUpdated: new Date(),
    },
    { upsert: true, new: true },
  );
}

/**
 * Delete user stats
 */
export async function deleteUserStats(userId: string): Promise<void> {
  await connectDB();
  await UserStats.deleteOne({ userId });
}

/**
 * Check if user has stats
 */
export async function hasStats(userId: string): Promise<boolean> {
  await connectDB();
  const count = await UserStats.countDocuments({ userId });
  return count > 0;
}
