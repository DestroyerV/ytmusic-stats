import { GoogleTakeoutEntry, ParsedSongInfo } from "@/lib/types/database";

/**
 * Google Takeout JSON Parser Service
 *
 * Parses YouTube Music entries from Google Takeout watch-history.json files
 * and extracts song information with intelligent title parsing.
 */
export class GoogleTakeoutParser {
  private static readonly MAX_ERRORS = 100;
  
  /**
   * Standard parsing for all files
   */
  static async parseHistoryFile(jsonContent: string): Promise<{
    entries: ParsedSongInfo[];
    totalEntries: number;
    musicEntries: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    const entries: ParsedSongInfo[] = [];

    try {
      const data = JSON.parse(jsonContent) as GoogleTakeoutEntry[];

      if (!Array.isArray(data)) {
        throw new Error("Invalid JSON format: Expected an array of entries");
      }

      let musicEntries = 0;

      for (let i = 0; i < data.length; i++) {
        try {
          const entry = data[i];

          // Filter for YouTube Music entries
          if (!this.isYouTubeMusicEntry(entry)) {
            continue;
          }

          musicEntries++;
          const parsedSong = this.parseSongEntry(entry);

          if (parsedSong) {
            entries.push(parsedSong);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          errors.push(`Error processing entry ${i}: ${errorMessage}`);

          // Stop if too many errors
          if (errors.length > this.MAX_ERRORS) {
            errors.push("Too many errors encountered, stopping parse");
            break;
          }
        }
      }

      return {
        entries,
        totalEntries: data.length,
        musicEntries,
        errors,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        entries: [],
        totalEntries: 0,
        musicEntries: 0,
        errors: [`Failed to parse JSON: ${errorMessage}`],
      };
    }
  }

  /**
   * Check if entry is from YouTube Music
   */
  private static isYouTubeMusicEntry(entry: GoogleTakeoutEntry): boolean {
    // Check if entry has required fields
    if (!entry.title || !entry.time) {
      return false;
    }

    // Must be from YouTube Music

    if (entry.header !== "YouTube Music") {
      return false;
    }

    // Filter out non-music content based on title patterns
    const title = entry.title.toLowerCase();

    // Exclude obvious video content
    const excludePatterns = [
      "watched a video that has been removed",
      "watched a private video",
      "watched a video",
      "visited youtube.com",
      "searched for",
    ];

    if (excludePatterns.some((pattern) => title.includes(pattern))) {
      return false;
    }

    // Must have a reasonable title length for music
    if (entry.title.length < 3 || entry.title.length > 200) {
      return false;
    }

    return true;
  }

  /**
   * Parse individual song entry
   */
  private static parseSongEntry(
    entry: GoogleTakeoutEntry
  ): ParsedSongInfo | null {
    try {
      const songInfo = this.extractSongInfo(entry);

      if (!songInfo) {
        return null;
      }

      // Parse timestamp
      const playedAt = new Date(entry.time);
      if (isNaN(playedAt.getTime())) {
        return null;
      }

      // Extract YouTube ID from URL if available
      let youtubeId: string | undefined;
      if (entry.titleUrl) {
        youtubeId = this.extractYouTubeId(entry.titleUrl);
      }

      return {
        title: songInfo.title,
        artist: songInfo.artist,
        originalTitle: entry.title,
        youtubeId,
        playedAt,
        confidence: songInfo.confidence,
      };
    } catch (error) {
      console.error("Error parsing song entry:", error);
      return null;
    }
  }

  /**
   * Extract song and artist information from entry
   */
  private static extractSongInfo(entry: GoogleTakeoutEntry): {
    title: string;
    artist: string;
    confidence: number;
  } | null {
    if (!entry.title) return null;

    // First, try to extract artist from subtitles (most reliable for YouTube Music)
    let artistFromSubtitles: string | null = null;
    if (
      entry.subtitles &&
      entry.subtitles.length > 0 &&
      entry.subtitles[0].name
    ) {
      artistFromSubtitles = this.cleanArtistName(entry.subtitles[0].name);
    }

    // Clean the title
    let cleanTitle = this.cleanTitle(entry.title);

    // If we have artist from subtitles, use it with high confidence
    if (artistFromSubtitles && artistFromSubtitles !== "") {
      // Try to extract song title from the main title, but fall back to the cleaned title
      let songTitle = cleanTitle;

      // Try to remove artist name from title if it appears there
      const artistPattern = new RegExp(
        `^${artistFromSubtitles.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )}\\s*[-–—·•:]?\\s*`,
        "i"
      );
      if (artistPattern.test(cleanTitle)) {
        songTitle = cleanTitle.replace(artistPattern, "").trim();
      }

      // If no song title extracted, try common patterns
      if (!songTitle) {
        const titlePatterns = [/^.+?[-–—·•:]\s*(.+)$/, /^(.+?)\s+by\s+.+$/i];

        for (const pattern of titlePatterns) {
          const match = cleanTitle.match(pattern);
          if (match && match[1]?.trim()) {
            songTitle = match[1].trim();
            break;
          }
        }
      }

      return {
        title: this.cleanSongTitle(songTitle || cleanTitle),
        artist: artistFromSubtitles,
        confidence: 0.95, // High confidence when using subtitles
      };
    }

    // Fallback: Try different parsing patterns from title (less reliable)
    const patterns = [
      // Pattern 1: "Artist - Song" (most reliable)
      {
        regex: /^(.+?)\s*[-–—]\s*(.+)$/,
        artistIndex: 1,
        titleIndex: 2,
        confidence: 0.7,
      },
      // Pattern 2: "Artist · Song" (common in YouTube Music)
      {
        regex: /^(.+?)\s*[·•]\s*(.+)$/,
        artistIndex: 1,
        titleIndex: 2,
        confidence: 0.7,
      },
      // Pattern 3: "Song by Artist"
      {
        regex: /^(.+?)\s+by\s+(.+)$/i,
        artistIndex: 2,
        titleIndex: 1,
        confidence: 0.6,
      },
      // Pattern 4: "Artist: Song"
      {
        regex: /^(.+?)\s*:\s*(.+)$/,
        artistIndex: 1,
        titleIndex: 2,
        confidence: 0.5,
      },
      // Pattern 5: "Song - Artist" (less common but possible)
      {
        regex: /^(.+?)\s*[-–—]\s*(.+)$/,
        artistIndex: 2,
        titleIndex: 1,
        confidence: 0.4,
      },
    ];

    for (const pattern of patterns) {
      const match = cleanTitle.match(pattern.regex);
      if (match) {
        const artist = match[pattern.artistIndex]?.trim();
        const songTitle = match[pattern.titleIndex]?.trim();

        if (artist && songTitle && artist.length > 0 && songTitle.length > 0) {
          return {
            title: this.cleanSongTitle(songTitle),
            artist: this.cleanArtistName(artist),
            confidence: pattern.confidence,
          };
        }
      }
    }

    // If no pattern matches, treat as song title with unknown artist
    return {
      title: this.cleanSongTitle(cleanTitle),
      artist: "Unknown Artist",
      confidence: 0.2,
    };
  }

  /**
   * Clean the raw title from Google Takeout
   */
  private static cleanTitle(title: string): string {
    return (
      title
        .trim()
        // Remove "Watched " prefix if present
        .replace(/^watched\s+/i, "")
        // Remove common YouTube suffixes
        .replace(/\s*\(official\s+(video|audio|music\s+video)\)$/i, "")
        .replace(/\s*\[official\s+(video|audio|music\s+video)\]$/i, "")
        .replace(/\s*-\s*official\s+(video|audio|music\s+video)$/i, "")
        // Remove lyrics indicators
        .replace(/\s*\((lyrics|lyric\s+video|with\s+lyrics)\)$/i, "")
        .replace(/\s*\[(lyrics|lyric\s+video|with\s+lyrics)\]$/i, "")
        // Remove HD/HQ indicators
        .replace(/\s*\[(hd|hq|4k)\]$/i, "")
        .replace(/\s*\((hd|hq|4k)\)$/i, "")
        // Remove year indicators
        .replace(/\s*\(\d{4}\)$/i, "")
        // Clean up extra whitespace
        .replace(/\s+/g, " ")
        .trim()
    );
  }

  /**
   * Clean song title
   */
  private static cleanSongTitle(title: string): string {
    return (
      title
        .trim()
        // Remove feat./ft. and everything after in song titles
        .replace(/\s+(feat\.|ft\.|featuring)\s+.+$/i, "")
        // Remove remix indicators if they seem to be part of title
        .replace(/\s*\(\s*remix\s*\)$/i, "")
        // Clean up
        .trim()
    );
  }

  /**
   * Clean artist name
   */
  private static cleanArtistName(artist: string): string {
    return (
      artist
        .trim()
        // Remove "- Topic" suffix (common in YouTube Music subtitles)
        .replace(/\s*-\s*topic$/i, "")
        // Remove "Official" suffix
        .replace(/\s+official$/i, "")
        // Remove "VEVO" suffix
        .replace(/\s+vevo$/i, "")
        // Remove "Records" suffix
        .replace(/\s+records$/i, "")
        // Clean up
        .trim()
    );
  }

  /**
   * Extract YouTube video ID from URL
   */
  private static extractYouTubeId(url: string): string | undefined {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }
}
