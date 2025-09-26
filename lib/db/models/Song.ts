import mongoose, { Schema, model, models } from "mongoose";
import { ISong } from "../../types/database";

const SongSchema = new Schema<ISong>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number, // in seconds
      required: true,
      min: 1,
    },
    youtubeId: {
      type: String,
      trim: true,
    },
    channelTitle: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: String,
      trim: true,
    },
    viewCount: {
      type: Number,
      min: 0,
    },
    genres: [
      {
        type: String,
        trim: true,
      },
    ],
    estimationMethod: {
      type: String,
      enum: ["youtube-api", "title-pattern", "genre-default", "global-average"],
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    playCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
SongSchema.index({ artist: 1 }); // Artist-based queries
SongSchema.index({ estimationMethod: 1 }); // For analytics
SongSchema.index({ confidence: -1 }); // Quality sorting
SongSchema.index({ playCount: -1 }); // Popularity sorting
SongSchema.index({ createdAt: -1 }); // Recent additions

// Compound indexes
SongSchema.index({ artist: 1, title: 1 });
SongSchema.index({ estimationMethod: 1, confidence: -1 });

export const Song = models.Song || model<ISong>("Song", SongSchema);
