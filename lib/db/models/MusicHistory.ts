import mongoose, { Schema, model, models } from 'mongoose';
import { IMusicHistory } from '../../types/database';

const MusicHistorySchema = new Schema<IMusicHistory>({
  userId: {
    type: String,
    required: true,
    index: true, // Add index for better query performance
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  fileContent: {
    type: String,
    required: false, // Optional field to store file content for processing
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: {
    type: Date,
  },
  totalEntries: {
    type: Number,
  },
  processedEntries: {
    type: Number,
    default: 0,
  },
  errorMessage: {
    type: String,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  processingStage: {
    type: String,
    enum: ['parsing', 'extracting', 'processing', 'generating-stats', 'completed'],
  },
});

// Indexes for performance
MusicHistorySchema.index({ status: 1 });
MusicHistorySchema.index({ uploadedAt: -1 });
MusicHistorySchema.index({ userId: 1, uploadedAt: -1 });

export const MusicHistory = models.MusicHistory || model<IMusicHistory>('MusicHistory', MusicHistorySchema);