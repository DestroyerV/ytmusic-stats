import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import {
  processMusicHistory,
  generateUserStats,
  enrichSongData,
  cleanupOldFiles,
} from "@/lib/inngest/functions";

// Create the handler and export it as both GET and POST
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processMusicHistory,
    generateUserStats,
    enrichSongData,
    cleanupOldFiles,
  ],
});
