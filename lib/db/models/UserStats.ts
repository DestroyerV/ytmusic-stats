import mongoose, { Schema, model, models } from "mongoose";
import { IUserStats } from "../../types/database";

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
        title: { type: String, required: true },
        artist: { type: String, required: true },
        playCount: { type: Number, required: true },
        totalDuration: { type: Number, required: true },
        songKey: { type: String, required: true },
      },
    ],
    topArtists: [
      {
        name: { type: String, required: true },
        playCount: { type: Number, required: true },
        totalDuration: { type: Number, required: true },
        uniqueSongs: { type: Number, required: true },
      },
    ],
    newArtistsThisMonth: { type: Number, default: 0 },
    totalNewArtists: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
UserStatsSchema.index({ lastUpdated: -1 });

export const UserStats =
  models.UserStats || model("UserStats", UserStatsSchema);
