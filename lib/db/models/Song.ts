import { model, models, Schema } from "mongoose";
import type { ISong } from "@/lib/types/database";

const SongSchema = new Schema<ISong>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    youtubeId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    artist: {
      type: String,
      required: true,
    },
    channelTitle: {
      type: String,
    },
    duration: {
      type: Number,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    artistImage: {
      type: String,
    },
    releaseDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const Song = models.Song || model("Song", SongSchema);
