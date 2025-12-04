/**
 * Client-side Google Takeout Parser
 *
 * Optimized for browser execution with:
 * - Chunked processing for mobile devices
 * - Memory-efficient parsing
 * - Progress callbacks
 */

import type {
  GoogleTakeoutEntry,
  ParsedSongInfo,
  ParseProgress,
  ParseResult,
} from "@/lib/types/database";

/**
 * Detect device capability for adaptive processing
 */
export function getDeviceCapability(): "high" | "low" {
  const cores = navigator.hardwareConcurrency || 4;
  const memory =
    (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile || cores <= 4 || memory <= 4) {
    return "low";
  }
  return "high";
}

/**
 * Get optimal batch size based on device capability
 */
function getBatchSize(capability: "high" | "low"): number {
  return capability === "high" ? 2000 : 500;
}

/**
 * Yield to browser to prevent UI freeze
 */
function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Check if entry is from YouTube Music
 */
function isYouTubeMusicEntry(entry: GoogleTakeoutEntry): boolean {
  if (!entry.title || !entry.time) {
    return false;
  }

  if (entry.header !== "YouTube Music") {
    return false;
  }

  const title = entry.title.toLowerCase();
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

  if (entry.title.length < 3 || entry.title.length > 200) {
    return false;
  }

  return true;
}

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeId(url: string): string | undefined {
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

/**
 * Clean the raw title from Google Takeout
 */
function cleanTitle(title: string): string {
  return title
    .trim()
    .replace(/^watched\s+/i, "")
    .replace(/\s*\(official\s+(video|audio|music\s+video)\)$/i, "")
    .replace(/\s*\[official\s+(video|audio|music\s+video)\]$/i, "")
    .replace(/\s*-\s*official\s+(video|audio|music\s+video)$/i, "")
    .replace(/\s*\((lyrics|lyric\s+video|with\s+lyrics)\)$/i, "")
    .replace(/\s*\[(lyrics|lyric\s+video|with\s+lyrics)\]$/i, "")
    .replace(/\s*\[(hd|hq|4k)\]$/i, "")
    .replace(/\s*\((hd|hq|4k)\)$/i, "")
    .replace(/\s*\(\d{4}\)$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Clean song title
 */
function cleanSongTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+(feat\.|ft\.|featuring)\s+.+$/i, "")
    .replace(/\s*\(\s*remix\s*\)$/i, "")
    .trim();
}

/**
 * Clean artist name
 */
export function cleanArtistName(artist: string): string {
  return artist
    .trim()
    .replace(/\s*-\s*topic$/i, "")
    .replace(/\s+official$/i, "")
    .replace(/\s+vevo$/i, "")
    .replace(/\s+music$/i, "")
    .replace(/\s+records$/i, "")
    .trim();
}

/**
 * Check if the artist/channel name is generic (like "Release", "Various Artists", etc.)
 */
export function isGenericArtist(artist: string): boolean {
  const genericNames = [
    "release",
    "various artists",
    "various",
    "unknown",
    "unknown artist",
    "music",
    "songs",
    "audio",
    "official",
    "lyrics",
    "lyric video",
    "audio library",
    "no copyright sounds",
    "ncs",
    "trap nation",
    "bass nation",
    "proximity",
    "mrsuicidesheep",
    "chill nation",
    "wave music",
    "vevo",
    "topic",
    "",
  ];

  const normalized = artist.toLowerCase().trim();
  return genericNames.some(
    (name) => normalized === name || (name && normalized.includes(name)),
  );
}

/**
 * Extract artist name from video title
 * Common patterns: "Artist - Song", "Artist | Song", "Song by Artist"
 */
export function extractArtistFromTitle(title: string): string | null {
  if (!title) return null;

  // Remove common suffixes first
  const cleanTitle = title
    .replace(
      /\s*\(Official\s*(Video|Audio|Music Video|Lyric Video|Lyrics)?\)/gi,
      "",
    )
    .replace(
      /\s*\[Official\s*(Video|Audio|Music Video|Lyric Video|Lyrics)?\]/gi,
      "",
    )
    .replace(/\s*\(Lyrics?\)/gi, "")
    .replace(/\s*\[Lyrics?\]/gi, "")
    .replace(/\s*\(Audio\)/gi, "")
    .replace(/\s*\[Audio\]/gi, "")
    .replace(/\s*\(HD\)/gi, "")
    .replace(/\s*\[HD\]/gi, "")
    .replace(/\s*\(HQ\)/gi, "")
    .replace(/\s*\[HQ\]/gi, "")
    .trim();

  // Pattern 1: "Artist - Song" (most common)
  const dashMatch = cleanTitle.match(/^(.+?)\s*[-–—]\s*.+$/);
  if (dashMatch?.[1]) {
    const artist = dashMatch[1].trim();
    if (artist.length > 2 && !/^\d+$/.test(artist)) {
      return artist;
    }
  }

  // Pattern 2: "Song by Artist"
  const byMatch = cleanTitle.match(/^.+?\s+by\s+(.+)$/i);
  if (byMatch?.[1]) {
    return byMatch[1].trim();
  }

  // Pattern 3: "Artist | Song"
  const pipeMatch = cleanTitle.match(/^(.+?)\s*\|\s*.+$/);
  if (pipeMatch?.[1]) {
    const artist = pipeMatch[1].trim();
    if (artist.length > 2 && !/^\d+$/.test(artist)) {
      return artist;
    }
  }

  // Pattern 4: "Artist: Song"
  const colonMatch = cleanTitle.match(/^(.+?)\s*:\s*.+$/);
  if (colonMatch?.[1]) {
    const artist = colonMatch[1].trim();
    if (artist.length > 2 && !/^\d+$/.test(artist)) {
      return artist;
    }
  }

  return null;
}

/**
 * Extract song and artist information from entry
 */
function extractSongInfo(entry: GoogleTakeoutEntry): {
  title: string;
  artist: string;
} | null {
  if (!entry.title) return null;

  let artistFromSubtitles: string | null = null;
  if (
    entry.subtitles &&
    entry.subtitles.length > 0 &&
    entry.subtitles[0].name
  ) {
    artistFromSubtitles = cleanArtistName(entry.subtitles[0].name);
  }

  const cleanedTitle = cleanTitle(entry.title);

  if (artistFromSubtitles && artistFromSubtitles !== "") {
    let songTitle = cleanedTitle;

    const artistPattern = new RegExp(
      `^${artistFromSubtitles.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[-–—·•:]?\\s*`,
      "i",
    );
    if (artistPattern.test(cleanedTitle)) {
      songTitle = cleanedTitle.replace(artistPattern, "").trim();
    }

    if (!songTitle) {
      const titlePatterns = [/^.+?[-–—·•:]\s*(.+)$/, /^(.+?)\s+by\s+.+$/i];
      for (const pattern of titlePatterns) {
        const match = cleanedTitle.match(pattern);
        if (match?.[1]?.trim()) {
          songTitle = match[1].trim();
          break;
        }
      }
    }

    return {
      title: cleanSongTitle(songTitle || cleanedTitle),
      artist: artistFromSubtitles,
    };
  }
  return {
    title: cleanSongTitle(cleanedTitle),
    artist: "Unknown Artist",
  };
}

/**
 * Parse a single entry into ParsedSongInfo
 */
function parseSongEntry(entry: GoogleTakeoutEntry): ParsedSongInfo | null {
  try {
    const songInfo = extractSongInfo(entry);
    if (!songInfo) return null;

    const playedAt = new Date(entry.time);
    if (Number.isNaN(playedAt.getTime())) return null;

    let youtubeId: string | undefined;
    if (entry.titleUrl) {
      youtubeId = extractYouTubeId(entry.titleUrl);
    }

    return {
      title: songInfo.title,
      artist: songInfo.artist,
      originalTitle: entry.title,
      youtubeId,
      playedAt,
    };
  } catch {
    return null;
  }
}

/**
 * Main parser function - processes file with adaptive chunking
 */
export async function parseGoogleTakeoutFile(
  fileContent: string,
  onProgress?: (progress: ParseProgress) => void,
): Promise<ParseResult> {
  const entries: ParsedSongInfo[] = [];
  const capability = getDeviceCapability();
  const batchSize = getBatchSize(capability);

  onProgress?.({ stage: "parsing", progress: 0 });

  // Parse JSON
  let data: GoogleTakeoutEntry[];

  data = JSON.parse(fileContent);

  if (!Array.isArray(data)) {
    return {
      entries: [],
      totalEntries: 0,
      musicEntries: 0,
      error: "Invalid format: Expected an array of entries.",
    };
  }

  const totalEntries = data.length;
  let musicEntries = 0;

  onProgress?.({
    stage: "filtering",
    progress: 10,
    totalEntries,
    entriesProcessed: 0,
  });

  // Process in batches
  for (let i = 0; i < data.length; i += batchSize) {
    const batchEnd = Math.min(i + batchSize, data.length);

    for (let j = i; j < batchEnd; j++) {
      const entry = data[j];

      if (!isYouTubeMusicEntry(entry)) {
        continue;
      }

      musicEntries++;
      const parsedSong = parseSongEntry(entry);

      if (parsedSong) {
        entries.push(parsedSong);
      }
    }

    // Calculate progress (10% to 90% for filtering)
    const progress = 10 + (batchEnd / totalEntries) * 80;

    onProgress?.({
      stage: "filtering",
      progress: Math.round(progress),
      totalEntries,
      entriesProcessed: batchEnd,
      musicEntries,
    });

    // Yield to browser to prevent freeze
    if (capability === "low" || i % (batchSize * 2) === 0) {
      await yieldToBrowser();
    }
  }

  // Help garbage collection
  data.length = 0;

  onProgress?.({
    stage: "complete",
    progress: 100,
    totalEntries,
    entriesProcessed: totalEntries,
    musicEntries,
  });

  return {
    entries,
    totalEntries,
    musicEntries,
  };
}

/**
 * Read and parse a File object
 */
export async function parseFile(
  file: File,
  onProgress?: (progress: ParseProgress) => void,
): Promise<ParseResult> {
  onProgress?.({ stage: "reading", progress: 0 });

  const text = await file.text();

  onProgress?.({ stage: "reading", progress: 5 });

  const result = await parseGoogleTakeoutFile(text, onProgress);

  return result;
}
