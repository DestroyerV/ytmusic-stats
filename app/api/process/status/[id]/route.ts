import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import connectDB from '@/lib/db/connect';
import { MusicHistory } from '@/lib/db/models';
import { ProcessingStatus } from '@/lib/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Await the params
    const { id } = await params;

    // Validate the ID parameter
    if (!id || id === 'undefined' || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid ID parameter' },
        { status: 400 }
      );
    }

    // Find the processing record
    let history;
    try {
      history = await MusicHistory.findById(id);
    } catch (error) {
      // Handle invalid ObjectId format
      if (error instanceof Error && error.name === 'CastError') {
        return NextResponse.json(
          { error: 'Invalid ID format' },
          { status: 400 }
        );
      }
      throw error; // Re-throw if it's not a cast error
    }

    if (!history) {
      return NextResponse.json(
        { error: 'History not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (history.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Calculate estimated time remaining
    let estimatedTimeRemaining: number | undefined;
    if (history.status === 'processing' && history.processedEntries && history.totalEntries) {
      const entriesRemaining = history.totalEntries - history.processedEntries;
      const processingRate = history.processedEntries / ((Date.now() - history.uploadedAt.getTime()) / 1000);
      
      if (processingRate > 0) {
        estimatedTimeRemaining = Math.round(entriesRemaining / processingRate);
      }
    }

    const status: ProcessingStatus = {
      historyId: history._id.toString(),
      status: history.status,
      progress: history.progress || 0,
      stage: history.processingStage,
      currentEntry: history.processedEntries,
      totalEntries: history.totalEntries,
      errorMessage: history.errorMessage,
      estimatedTimeRemaining,
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting processing status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}