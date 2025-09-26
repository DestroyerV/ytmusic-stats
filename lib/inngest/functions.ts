import { inngest } from "./client";
import { MusicHistory, HistoryEntry, Song } from "@/lib/db/models";
import { GoogleTakeoutParser } from "@/lib/services/google-takeout-parser";
import { SongDurationService } from "@/lib/services/song-duration";
import { YouTubeService } from "@/lib/services/youtube";
import { UserStatsService } from "@/lib/services/user-stats";
import connectDB from "@/lib/db/connect";
import mongoose from "mongoose";

/**
 * Main function to process uploaded music history files
 */
export const processMusicHistory = inngest.createFunction(
  {
    id: "process-music-history",
    name: "Process Music History File",
  },
  { event: "process/music-history" },
  async ({ event, step }) => {
    const { userId, historyId, fileName, fileSize } = event.data;

    // Step 1: Initialize processing
    await step.run("initialize-processing", async () => {
      await connectDB();

      await MusicHistory.findByIdAndUpdate(historyId, {
        status: "processing",
        processingStage: "parsing",
        progress: 0,
      });
    });

    // Step 2: Parse JSON file with adaptive memory management
    const parseResult = await step.run("parse-json-file", async () => {
      try {
        // Get file content from database
        const musicHistory = await MusicHistory.findById(historyId);
        if (!musicHistory?.fileContent) {
          throw new Error("File content not found in database");
        }
        const jsonContent = musicHistory.fileContent;

        // Update progress
        await MusicHistory.findByIdAndUpdate(historyId, {
          processingStage: "extracting",
          progress: 10,
        });

        // Use adaptive parser with batch callback for progress updates
        const result = await GoogleTakeoutParser.parseHistoryFile(jsonContent);

        await MusicHistory.findByIdAndUpdate(historyId, {
          totalEntries: result.totalEntries,
          processedEntries: result.entries.length,
          progress: 50,
        });

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        await MusicHistory.findByIdAndUpdate(historyId, {
          status: "failed",
          errorMessage,
        });
        throw error;
      }
    });

    if (parseResult.entries.length === 0) {
      await MusicHistory.findByIdAndUpdate(historyId, {
        status: "failed",
        errorMessage: "No valid music entries found in the file",
      });
      return { success: false, error: "No valid music entries found" };
    }

    // Step 3: Process entries in batches
    const totalEntries = parseResult.entries.length;
    const processingBatchSize = 50; // Fixed batch size for simplicity
    const totalBatches = Math.ceil(totalEntries / processingBatchSize);

    for (let i = 0; i < totalBatches; i++) {
      await step.run(`process-batch-${i}`, async () => {
        const startIndex = i * processingBatchSize;
        const endIndex = Math.min(
          startIndex + processingBatchSize,
          totalEntries,
        );
        const batch = parseResult.entries.slice(startIndex, endIndex);

        // Process batch with efficient YouTube API batching
        const processedBatch = await SongDurationService.batchEstimateDurations(
          batch.map((song) => ({
            artist: song.artist,
            title: song.title,
            youtubeId: song.youtubeId,
          })),
        );

        // Map to the required format
        const formattedBatch = processedBatch.map((result, index) => ({
          historyId,
          songTitle: result.title,
          artistName: result.artist,
          playedAt: batch[index].playedAt,
          duration: result.duration,
          youtubeId: batch[index].youtubeId,
          songKey: SongDurationService.createSongKey(
            result.artist,
            result.title,
          ),
          originalTitle: batch[index].originalTitle,
        }));

        // Bulk insert history entries
        await HistoryEntry.insertMany(formattedBatch);

        // Update progress (50% to 85% for processing)
        const progressPercent = 50 + ((i + 1) / totalBatches) * 35;
        await MusicHistory.findByIdAndUpdate(historyId, {
          processedEntries: endIndex,
          progress: Math.round(progressPercent),
        });
      });
    }

    // Step 4: Generate user statistics
    await step.run("generate-user-statistics", async () => {
      await MusicHistory.findByIdAndUpdate(historyId, {
        processingStage: "generating-stats",
        progress: 85,
      });

      // Trigger stats generation
      await inngest.send({
        name: "generate/user-stats",
        data: { userId, historyId },
      });
    });

    // Step 5: Mark as completed and cleanup memory
    await step.run("complete-processing", async () => {
      await MusicHistory.findByIdAndUpdate(historyId, {
        status: "completed",
        processingStage: "completed",
        progress: 100,
        processedAt: new Date(),
      });

      // Clear parseResult from memory immediately
      parseResult.entries = [];
    });

    // Step 6: Schedule background enrichment (optional)
    await step.run("schedule-enrichment", async () => {
      try {
        // Get unique song keys for enrichment
        const uniqueSongs = await HistoryEntry.distinct("songKey", {
          historyId,
        });

        if (uniqueSongs.length > 0) {
          // Schedule background YouTube enrichment for songs without API data
          await inngest.send({
            name: "enrich/song-data",
            data: {
              songKeys: uniqueSongs.slice(0, 100), // Limit to 100 songs per batch
              priority: "low",
            },
          });
        }
      } catch (error) {
        // Don't fail the main processing if enrichment scheduling fails
        console.error("Failed to schedule enrichment:", error);
      }
    });

    // Step 7: Trigger cleanup (runs after each processing)
    await step.run("trigger-cleanup", async () => {
      try {
        // Cleanup files older than 1 day
        await inngest.send({
          name: "cleanup/old-files",
          data: {
            olderThanDays: 7, // Delete files older than 7 days
          },
        });
      } catch (error) {
        // Don't fail the main processing if cleanup scheduling fails
        console.error("Failed to schedule cleanup:", error);
      }
    });

    return {
      success: true,
      processedEntries: parseResult.entries.length,
      totalEntries: parseResult.totalEntries,
    };
  },
);

/**
 * Generate comprehensive user statistics
 */
export const generateUserStats = inngest.createFunction(
  {
    id: "generate-user-stats",
    name: "Generate User Statistics",
  },
  { event: "generate/user-stats" },
  async ({ event, step }) => {
    const { userId, historyId } = event.data;

    await step.run("calculate-stats", async () => {
      await connectDB();

      // Use only the current history ID since we clean up old data on new uploads
      const historyObjectIds = [new mongoose.Types.ObjectId(historyId)];

      // Basic aggregate stats
      const stats = await HistoryEntry.aggregate([
        {
          $match: { historyId: { $in: historyObjectIds } },
        },
        {
          $group: {
            _id: null,
            totalListens: { $sum: 1 }, // Total play count
            totalPlaytime: { $sum: "$duration" },
            uniqueArtists: { $addToSet: "$artistName" },
            uniqueSongs: { $addToSet: "$songKey" },
            firstPlay: { $min: "$playedAt" },
            lastPlay: { $max: "$playedAt" },
            avgDuration: { $avg: "$duration" },
          },
        },
      ]);

      if (stats.length > 0) {
        const stat = stats[0];
        const now = new Date();
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Calculate monthly playtime
        const monthlyStats = await HistoryEntry.aggregate([
          {
            $match: {
              historyId: { $in: historyObjectIds },
              playedAt: { $gte: currentMonth },
            },
          },
          {
            $group: {
              _id: null,
              monthlyPlaytime: { $sum: "$duration" },
              monthlyListens: { $sum: 1 },
            },
          },
        ]);

        // Calculate daily listening patterns for longest day and sessions
        const dailyStats = await HistoryEntry.aggregate([
          {
            $match: { historyId: { $in: historyObjectIds } },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$playedAt" },
              },
              dailyDuration: { $sum: "$duration" },
              dailyListens: { $sum: 1 },
            },
          },
          { $sort: { dailyDuration: -1 } },
        ]);

        // Calculate listening sessions (songs played within 1 hour of each other)
        const sessionsData = await HistoryEntry.find({
          historyId: { $in: historyObjectIds },
        }).sort({ playedAt: 1 });

        let longestSession = 0;
        let currentSession = 0;
        let lastPlayTime: Date | null = null;

        for (const entry of sessionsData) {
          if (
            lastPlayTime &&
            entry.playedAt.getTime() - lastPlayTime.getTime() <= 3600000
          ) {
            // 1 hour
            currentSession += entry.duration || 0;
          } else {
            longestSession = Math.max(longestSession, currentSession);
            currentSession = entry.duration || 0;
          }
          lastPlayTime = entry.playedAt;
        }
        longestSession = Math.max(longestSession, currentSession);

        // Get top 10 songs with play counts
        const topSongs = await HistoryEntry.aggregate([
          { $match: { historyId: { $in: historyObjectIds } } },
          {
            $group: {
              _id: "$songKey",
              title: { $first: "$songTitle" },
              artist: { $first: "$artistName" },
              playCount: { $sum: 1 },
              totalDuration: { $sum: "$duration" },
            },
          },
          { $sort: { playCount: -1 } },
          { $limit: 10 },
        ]);

        // Get top 10 artists with detailed stats
        const topArtists = await HistoryEntry.aggregate([
          { $match: { historyId: { $in: historyObjectIds } } },
          {
            $group: {
              _id: "$artistName",
              playCount: { $sum: 1 },
              totalDuration: { $sum: "$duration" },
              uniqueSongs: { $addToSet: "$songKey" },
            },
          },
          {
            $project: {
              name: "$_id",
              playCount: 1,
              totalDuration: 1,
              uniqueSongs: { $size: "$uniqueSongs" },
            },
          },
          { $sort: { playCount: -1 } },
          { $limit: 10 },
        ]);

        // Calculate new artists this month
        const newArtistsThisMonth = await HistoryEntry.aggregate([
          {
            $match: {
              historyId: { $in: historyObjectIds },
              playedAt: { $gte: currentMonth },
            },
          },
          {
            $group: {
              _id: "$artistName",
              firstPlay: { $min: "$playedAt" },
            },
          },
          {
            $match: {
              firstPlay: { $gte: currentMonth },
            },
          },
          { $count: "newArtists" },
        ]);

        // Calculate total days and averages
        const totalDays =
          stat.firstPlay && stat.lastPlay
            ? Math.max(
                1,
                Math.ceil(
                  (stat.lastPlay.getTime() - stat.firstPlay.getTime()) /
                    (1000 * 60 * 60 * 24),
                ),
              )
            : 1;

        const dailyAverageListens = stat.totalListens / totalDays;
        const dailyAveragePlaytime = stat.totalPlaytime / totalDays;

        // Update user stats using the new service
        await UserStatsService.updateUserStats(userId, {
          totalSongs: stat.uniqueSongs.length,
          totalArtists: stat.uniqueArtists.length,
          totalPlaytime: stat.totalPlaytime || 0,
          averageSongLength: stat.avgDuration || 210,
          topArtist: topArtists[0]?.name,
          topSong: topSongs[0]
            ? `${topSongs[0].artist} - ${topSongs[0].title}`
            : undefined,
          firstPlayDate: stat.firstPlay,
          lastPlayDate: stat.lastPlay,
          lastUpdated: new Date(),
          totalListens: stat.totalListens,
          monthlyPlaytime: monthlyStats[0]?.monthlyPlaytime || 0,
          dailyAverageListens,
          dailyAveragePlaytime,
          longestListenDay: dailyStats[0]
            ? new Date(dailyStats[0]._id)
            : undefined,
          longestListenDayDuration: dailyStats[0]?.dailyDuration || 0,
          longestSession,
          topSongs: topSongs.map((song) => ({
            title: song.title,
            artist: song.artist,
            playCount: song.playCount,
            totalDuration: song.totalDuration || 0,
            songKey: song._id,
          })),
          topArtists: topArtists.map((artist) => ({
            name: artist.name,
            playCount: artist.playCount,
            totalDuration: artist.totalDuration || 0,
            uniqueSongs: artist.uniqueSongs,
          })),
          newArtistsThisMonth: newArtistsThisMonth[0]?.newArtists || 0,
          totalNewArtists: stat.uniqueArtists.length,
        });
      }
    });

    return { success: true };
  },
);

/**
 * Background song data enrichment using YouTube API
 */
export const enrichSongData = inngest.createFunction(
  {
    id: "enrich-song-data",
    name: "Enrich Song Data with YouTube",
  },
  { event: "enrich/song-data" },
  async ({ event, step }) => {
    const { songKeys, priority = "low" } = event.data;

    await step.run("youtube-enrichment", async () => {
      await connectDB();

      // Get songs that need enrichment (not from YouTube API) and have YouTube IDs
      // Use a more robust approach that checks both Song collection and HistoryEntry
      const songsToEnrich = await Song.find({
        key: { $in: songKeys },
        estimationMethod: { $nin: ["youtube-api"] },
      }).limit(50); // Rate limit

      // Filter songs that have YouTube IDs (either in Song record or we'll get from HistoryEntry)
      const songsWithYouTubeData = [];

      for (const song of songsToEnrich) {
        let youtubeId = song.youtubeId;

        // If song doesn't have youtubeId, try to get it from HistoryEntry
        if (!youtubeId) {
          const historyEntry = await HistoryEntry.findOne({
            songKey: song.key,
            youtubeId: { $exists: true, $ne: null },
          });
          youtubeId = historyEntry?.youtubeId;
        }

        if (youtubeId) {
          songsWithYouTubeData.push({
            ...song.toObject(),
            youtubeId,
          });
        }
      }

      if (songsWithYouTubeData.length === 0) {
        return { enriched: 0 };
      }

      let enrichedCount = 0;

      // Get YouTube IDs for batch processing
      const videoIds = songsWithYouTubeData
        .map((song) => song.youtubeId)
        .filter((id) => id) as string[];

      if (videoIds.length > 0) {
        try {
          // Use batch API to get metadata for multiple videos
          const youtubeResults =
            await YouTubeService.batchGetVideoMetadataBulk(videoIds);

          // Update songs with the retrieved data
          for (const song of songsWithYouTubeData) {
            if (song.youtubeId && youtubeResults.has(song.youtubeId)) {
              const youtubeData = youtubeResults.get(song.youtubeId)!;

              await SongDurationService.updateSongWithAPIData(
                song.artist,
                song.title,
                youtubeData.duration,
                "youtube",
                {
                  youtubeId: song.youtubeId,
                  genres: youtubeData.tags,
                  channelTitle: youtubeData.channelTitle,
                  categoryId: youtubeData.categoryId,
                  viewCount: youtubeData.viewCount,
                },
              );
              enrichedCount++;
            }
          }
        } catch (error) {
          console.error("Error batch enriching songs with YouTube API:", error);
        }
      }

      return { enriched: enrichedCount };
    });
  },
);

/**
 * Cleanup old uploaded files and processing data
 */
export const cleanupOldFiles = inngest.createFunction(
  {
    id: "cleanup-old-files",
    name: "Cleanup Old Files",
  },
  { event: "cleanup/old-files" },
  async ({ event, step }) => {
    const { olderThanDays = 1 } = event.data;

    await step.run("cleanup-old-files", async () => {
      await connectDB();

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      // Find old completed histories
      const oldHistories = await MusicHistory.find({
        status: "completed",
        processedAt: { $lt: cutoffDate },
      });

      let deletedHistories = 0;
      let deletedEntries = 0;

      // Delete old files and their entries
      for (const history of oldHistories) {
        // Delete associated history entries
        const entryResult = await HistoryEntry.deleteMany({
          historyId: history._id,
        });
        deletedEntries += entryResult.deletedCount || 0;

        // Delete the history record
        await MusicHistory.findByIdAndDelete(history._id);
        deletedHistories++;
      }

      return {
        success: true,
        deletedHistories,
        deletedEntries,
      };
    });
  },
);
