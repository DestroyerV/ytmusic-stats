import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "ytmusic-stats",
  name: "YouTube Music Stats",
  // Add event and signing keys if available in production
  ...(process.env.INNGEST_EVENT_KEY && {
    eventKey: process.env.INNGEST_EVENT_KEY,
  }),
  ...(process.env.INNGEST_SIGNING_KEY && {
    signingKey: process.env.INNGEST_SIGNING_KEY,
  }),
});

// Event types for type safety
export type Events = {
  "process/music-history": {
    data: {
      userId: string;
      historyId: string;
      fileName: string;
      fileSize: number;
    };
  };

  "enrich/song-data": {
    data: {
      songKeys: string[];
      priority?: "high" | "low";
    };
  };

  "generate/user-stats": {
    data: {
      userId: string;
      historyId: string;
    };
  };

  "cleanup/old-files": {
    data: {
      olderThanDays: number;
    };
  };
};
