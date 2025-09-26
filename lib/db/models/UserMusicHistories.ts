import mongoose, { Schema, model, models } from "mongoose";

const UserMusicHistoriesSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    musicHistoryId: {
      type: String,
      ref: "MusicHistory",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient queries
UserMusicHistoriesSchema.index(
  { userId: 1, musicHistoryId: 1 },
  { unique: true },
);

export const UserMusicHistories =
  models.UserMusicHistories ||
  model("UserMusicHistories", UserMusicHistoriesSchema);
