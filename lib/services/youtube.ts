/**
 * YouTube Data API Service for song metadata enrichment
 *
 * This service uses YouTube Data API v3 to get accurate metadata
 * directly from YouTube videos using their video IDs.
 */
export class YouTubeService {
  private static readonly BASE_URL = "https://www.googleapis.com/youtube/v3";

  /**
   * @deprecated Use batchGetVideoMetadataBulk() instead for better quota efficiency
   * Get video metadata from YouTube Data API for a single video
   * This method is kept for backward compatibility but should be avoided
   */
  static async getVideoMetadata(videoId: string): Promise<{
    duration: number;
    title: string;
    channelTitle: string;
    tags: string[];
    categoryId: string;
    publishedAt: string;
    viewCount: number;
    confidence: number;
  } | null> {
    console.warn(
      "getVideoMetadata is deprecated. Use batchGetVideoMetadataBulk() for better quota efficiency."
    );

    // Use the efficient batch method for single video
    const results = await this.batchGetVideoMetadataBulk([videoId]);
    return results.get(videoId) || null;
  }

  /**
   * Parse ISO 8601 duration format (PT#H#M#S) to seconds
   */
  private static parseDuration(duration: string): number {
    if (!duration || !duration.startsWith("PT")) {
      return 0;
    }

    const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!matches) {
      return 0;
    }

    const hours = parseInt(matches[1] || "0", 10);
    const minutes = parseInt(matches[2] || "0", 10);
    const seconds = parseInt(matches[3] || "0", 10);

    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Enhanced batch method that can handle batch API calls
   */
  static async batchGetVideoMetadataBulk(videoIds: string[]): Promise<
    Map<
      string,
      {
        duration: number;
        title: string;
        channelTitle: string;
        tags: string[];
        categoryId: string;
        publishedAt: string;
        viewCount: number;
        confidence: number;
      }
    >
  > {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const results = new Map();

    if (!apiKey) {
      console.warn("YouTube API key not configured");
      return results;
    }

    // YouTube API allows up to 50 video IDs per request
    const batchSize = 50;

    for (let i = 0; i < videoIds.length; i += batchSize) {
      const batch = videoIds.slice(i, i + batchSize);

      try {
        const url = new URL(`${this.BASE_URL}/videos`);
        url.searchParams.set("id", batch.join(","));
        url.searchParams.set("key", apiKey);
        url.searchParams.set("part", "snippet,contentDetails,statistics");

        const response = await fetch(url.toString());

        if (!response.ok) {
          if (response.status === 403) {
            console.warn("YouTube API quota exceeded");
            break; // Stop processing if quota exceeded
          }
          continue; // Skip this batch
        }

        const data = await response.json();

        if (data.items) {
          for (const video of data.items) {
            const snippet = video.snippet;
            const contentDetails = video.contentDetails;
            const statistics = video.statistics;

            const duration = this.parseDuration(contentDetails.duration);

            if (duration > 0) {
              results.set(video.id, {
                duration,
                title: snippet.title || "",
                channelTitle: snippet.channelTitle || "",
                tags: snippet.tags || [],
                categoryId: snippet.categoryId || "",
                publishedAt: snippet.publishedAt || "",
                viewCount: parseInt(statistics?.viewCount || "0", 10),
                confidence: 1.0,
              });
            }
          }
        }

        // Rate limiting delay between batches (slightly increased for better quota management)
        if (i + batchSize < videoIds.length) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error(`Error processing batch ${i}-${i + batchSize}:`, error);
        continue;
      }
    }

    return results;
  }
}
