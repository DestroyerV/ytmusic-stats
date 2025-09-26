import mongoose, { Schema, model, models } from "mongoose";
import { IHistoryEntry } from "../../types/database";

const HistoryEntrySchema = new Schema<IHistoryEntry>(
  {
    historyId: {
      type: Schema.Types.ObjectId,
      ref: "MusicHistory",
      required: true,
    },
    songTitle: {
      type: String,
      required: true,
      trim: true,
    },
    artistName: {
      type: String,
      required: true,
      trim: true,
    },
    playedAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in seconds
    },
    youtubeId: {
      type: String,
      trim: true,
    },
    songKey: {
      type: String,
      required: true,
      index: true,
    },
    originalTitle: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for performance optimization
HistoryEntrySchema.index({ historyId: 1, playedAt: -1 });
HistoryEntrySchema.index({ songKey: 1, playedAt: -1 });
HistoryEntrySchema.index({ artistName: 1, playedAt: -1 });
HistoryEntrySchema.index({ playedAt: -1 });

// For aggregation queries
HistoryEntrySchema.index({ historyId: 1, artistName: 1 });
HistoryEntrySchema.index({ historyId: 1, songKey: 1 });

export const HistoryEntry =
  models.HistoryEntry ||
  model<IHistoryEntry>("HistoryEntry", HistoryEntrySchema);
