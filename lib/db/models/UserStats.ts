import { model, models, Schema } from "mongoose";
import type { IUserStats } from "../../types/database";

const UserStatsSchema = new Schema<IUserStats & { userId: string }>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    totalSongs: { type: Number, default: 0 },
    totalArtists: { type: Number, default: 0 },
    totalPlaytime: { type: Number, default: 0 },
    averageSongLength: { type: Number, default: 0 },
    topArtist: { type: String },
    topSong: { type: String },
    firstPlayDate: { type: Date },
    lastPlayDate: { type: Date },
    lastUpdated: { type: Date, default: Date.now },
    totalListens: { type: Number, default: 0 },
    monthlyPlaytime: { type: Number, default: 0 },
    dailyAverageListens: { type: Number, default: 0 },
    dailyAveragePlaytime: { type: Number, default: 0 },
    longestListenDay: { type: Date },
    longestListenDayDuration: { type: Number, default: 0 },
    longestSession: { type: Number, default: 0 },
    topSongs: [
      {
        key: { type: String, required: true },
        title: { type: String, required: true },
        artist: { type: String, required: true },
        channelTitle: { type: String },
        youtubeId: { type: String },
        duration: { type: Number, default: 0 },
        playCount: { type: Number, required: true },
        totalDuration: { type: Number, required: true },
        thumbnail: { type: String },
        artistImage: { type: String },
      },
    ],
    topArtists: [
      {
        name: { type: String, required: true },
        playCount: { type: Number, required: true },
        totalDuration: { type: Number, required: true },
        uniqueSongs: { type: Number, required: true },
        artistImage: { type: String },
      },
    ],
    newArtistsThisMonth: { type: Number, default: 0 },
    totalNewArtists: { type: Number, default: 0 },
    // Song Age statistics (Spotify Wrapped style)
    listeningAge: { type: Number },
    averageReleaseYear: { type: Number },
    musicEra: { type: String },
    decadeDistribution: [
      {
        decade: { type: String, required: true },
        count: { type: Number, required: true },
        percentage: { type: Number, required: true },
      },
    ],
    oldestSong: {
      title: { type: String },
      artist: { type: String },
      year: { type: Number },
    },
    newestSong: {
      title: { type: String },
      artist: { type: String },
      year: { type: Number },
    },
    songsWithYearCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

export const UserStats =
  models.UserStats || model("UserStats", UserStatsSchema);
