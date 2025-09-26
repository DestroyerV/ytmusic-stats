import { ObjectId } from "mongoose";

export interface IUser {
  _id: string;
  email: string;
  name?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  musicHistories: ObjectId[];
  stats?: IUserStats;
}

export interface IUserStats {
  totalSongs: number;
  totalArtists: number;
  totalPlaytime: number; // in seconds
  averageSongLength: number; // in seconds
  topArtist?: string;
  topSong?: string;
  firstPlayDate?: Date;
  lastPlayDate?: Date;
  lastUpdated: Date;
  totalListens: number; // Total play count (can be more than unique songs)
  monthlyPlaytime: number; // Current month playtime in seconds
  dailyAverageListens: number; // Average listens per day
  dailyAveragePlaytime: number; // Average playtime per day in seconds
  longestListenDay?: Date; // Date with most listening time
  longestListenDayDuration: number; // Duration of longest listen day in seconds
  longestSession: number; // Longest continuous session in seconds
  topSongs: Array<{
    title: string;
    artist: string;
    playCount: number;
    totalDuration: number;
    songKey: string;
  }>; // Top 10 songs with play counts
  topArtists: Array<{
    name: string;
    playCount: number;
    totalDuration: number;
    uniqueSongs: number;
  }>; // Top 10 artists with detailed stats
  newArtistsThisMonth: number; // New artists discovered this month
  totalNewArtists: number; // Total artists discovered since first play
}

export interface IMusicHistory {
  _id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  fileContent?: string; // Store the actual file content for processing
  status: "pending" | "processing" | "completed" | "failed";
  uploadedAt: Date;
  processedAt?: Date;
  totalEntries?: number;
  processedEntries?: number;
  errorMessage?: string;
  progress?: number; // 0-100
  processingStage?:
    | "parsing"
    | "extracting"
    | "processing"
    | "generating-stats"
    | "completed";
}

export interface IHistoryEntry {
  _id?: string;
  historyId: ObjectId;
  songTitle: string;
  artistName: string;
  playedAt: Date;
  duration?: number; // seconds
  youtubeId?: string;
  songKey: string; // "artist - song" (normalized)
  originalTitle?: string; // original title from JSON
}

export interface ISong {
  _id?: string;
  key: string; // "artist - song" (unique, normalized)
  title: string;
  artist: string;
  duration: number; // seconds
  youtubeId?: string;
  channelTitle?: string;
  categoryId?: string;
  viewCount?: number;
  genres: string[];
  estimationMethod:
    | "youtube-api"
    | "title-pattern"
    | "genre-default"
    | "global-average";
  confidence: number; // 0-1, how confident we are in the duration
  createdAt: Date;
  updatedAt: Date;
  playCount?: number; // how many times this song has been played across all users
}

export interface IListeningPattern {
  userId: string;
  date: Date; // date only (time set to 00:00:00)
  hour: number; // 0-23
  dayOfWeek: number; // 0-6 (Sunday = 0)
  month: number; // 0-11
  year: number;
  songCount: number;
  totalDuration: number; // seconds
}

export interface IArtistStats {
  userId: string;
  artistName: string;
  playCount: number;
  totalDuration: number; // seconds
  uniqueSongs: number;
  firstPlayed: Date;
  lastPlayed: Date;
}

export interface ISongStats {
  userId: string;
  songKey: string;
  songTitle: string;
  artistName: string;
  playCount: number;
  totalDuration: number; // seconds
  firstPlayed: Date;
  lastPlayed: Date;
}

// For Google Takeout JSON structure
export interface GoogleTakeoutEntry {
  header: string;
  title: string;
  titleUrl?: string;
  subtitles?: Array<{
    name: string;
    url?: string;
  }>;
  time: string;
  products: string[];
  activityControls?: string[];
}

// Parsed song information
export interface ParsedSongInfo {
  title: string;
  artist: string;
  originalTitle: string;
  youtubeId?: string;
  playedAt: Date;
  confidence: number; // 0-1, how confident we are in the parsing
}

// Processing status for real-time updates
export interface ProcessingStatus {
  historyId: string;
  status: IMusicHistory["status"];
  progress: number;
  stage: IMusicHistory["processingStage"];
  currentEntry?: number;
  totalEntries?: number;
  errorMessage?: string;
  estimatedTimeRemaining?: number; // seconds
}

// Duration estimation context
export interface DurationEstimationContext {
  title: string;
  artist: string;
  genres?: string[];
  titlePatterns?: {
    hasRemix: boolean;
    hasExtended: boolean;
    hasIntro: boolean;
    hasOutro: boolean;
    hasLive: boolean;
    hasAcoustic: boolean;
  };
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ProcessingStatusResponse {
  processId: string;
  status: IMusicHistory["status"];
  progress: number;
  error?: string;
  createdAt: Date;
}

export interface ErrorResponse {
  error: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  count: number;
  duration?: number;
  label?: string;
}

export interface TopArtistData {
  name: string;
  playCount: number;
  duration: number;
  uniqueSongs: number;
  percentage: number;
}

export interface TopSongData {
  title: string;
  artist: string;
  playCount: number;
  duration: number;
  percentage: number;
}
