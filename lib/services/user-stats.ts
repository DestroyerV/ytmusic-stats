import { UserStats, UserMusicHistories } from "@/lib/db/models";
import { IUserStats } from "@/lib/types/database";
import connectDB from "@/lib/db/connect";

/**
 * Simple service for managing user stats and music histories
 * This works with Better-Auth user IDs directly
 */
export class UserStatsService {
  /**
   * Get user stats by Better-Auth user ID
   */
  static async getUserStats(userId: string): Promise<IUserStats | null> {
    await connectDB();

    const userStats = await UserStats.findOne({ userId });
    if (!userStats) {
      return null;
    }

    return {
      totalSongs: userStats.totalSongs,
      totalArtists: userStats.totalArtists,
      totalPlaytime: userStats.totalPlaytime,
      averageSongLength: userStats.averageSongLength,
      topArtist: userStats.topArtist,
      topSong: userStats.topSong,
      firstPlayDate: userStats.firstPlayDate,
      lastPlayDate: userStats.lastPlayDate,
      lastUpdated: userStats.lastUpdated,
      totalListens: userStats.totalListens,
      monthlyPlaytime: userStats.monthlyPlaytime,
      dailyAverageListens: userStats.dailyAverageListens,
      dailyAveragePlaytime: userStats.dailyAveragePlaytime,
      longestListenDay: userStats.longestListenDay,
      longestListenDayDuration: userStats.longestListenDayDuration,
      longestSession: userStats.longestSession,
      topSongs: userStats.topSongs,
      topArtists: userStats.topArtists,
      newArtistsThisMonth: userStats.newArtistsThisMonth,
      totalNewArtists: userStats.totalNewArtists,
    };
  }

  /**
   * Update or create user stats
   */
  static async updateUserStats(
    userId: string,
    stats: IUserStats
  ): Promise<void> {
    await connectDB();

    await UserStats.findOneAndUpdate(
      { userId },
      {
        userId,
        ...stats,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );
  }

  /**
   * Get user's music history IDs
   */
  static async getUserMusicHistories(userId: string): Promise<string[]> {
    await connectDB();

    const histories = await UserMusicHistories.find({ userId })
      .select("musicHistoryId")
      .lean();

    return histories.map((h) => h.musicHistoryId);
  }

  /**
   * Add a music history to user
   */
  static async addMusicHistory(
    userId: string,
    musicHistoryId: string
  ): Promise<void> {
    await connectDB();

    await UserMusicHistories.findOneAndUpdate(
      { userId, musicHistoryId },
      { userId, musicHistoryId },
      { upsert: true }
    );
  }

  /**
   * Remove a music history from user
   */
  static async removeMusicHistory(
    userId: string,
    musicHistoryId: string
  ): Promise<void> {
    await connectDB();

    await UserMusicHistories.deleteOne({ userId, musicHistoryId });
  }

  /**
   * Check if user has any music histories
   */
  static async hasAnyMusicHistories(userId: string): Promise<boolean> {
    await connectDB();

    const count = await UserMusicHistories.countDocuments({ userId });
    return count > 0;
  }

  /**
   * Clear all music histories for a user
   */
  static async clearUserMusicHistories(userId: string): Promise<void> {
    await connectDB();

    await UserMusicHistories.deleteMany({ userId });
  }
}
