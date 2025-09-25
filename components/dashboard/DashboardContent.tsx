"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardLoading } from "@/components/ui/loading";
import { ProcessingStatus } from "../processing-status";
import {
  Music,
  Upload,
  TrendingUp,
  Calendar,
  BarChart3,
  Clock,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { StatsOverview } from "./StatsOverview";
import { TopArtists } from "./TopArtists";
import { TopSongs } from "./TopSongs";
import { ListeningPatterns } from "./ListeningPatterns";
import { motion, type Variants } from "motion/react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

interface DashboardContentProps {
  userId: string;
}

export function DashboardContent({ userId }: DashboardContentProps) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const wasJustUploaded = searchParams.get("uploaded") === "true";

  // Check if user has any processed music history
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["stats", userId],
    queryFn: async () => {
      const response = await fetch("/api/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      return response.json();
    },
  });

  // Check for any ongoing processing
  const { data: processing, refetch: refetchProcessing } = useQuery({
    queryKey: ["processing-status"],
    queryFn: async () => {
      const response = await fetch("/api/process/status/latest");
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch processing status");
      }
      return response.json();
    },
    refetchInterval: (query) => {
      // Refetch more frequently if processing is ongoing or if we just uploaded
      const isProcessing = query.state.data?.status === "processing";
      if (isProcessing || wasJustUploaded) {
        return 2000; // 2 seconds
      }
      return false;
    },
  });

  // Force refetch processing status if we just uploaded
  useEffect(() => {
    if (wasJustUploaded) {
      // Wait a moment for the processing to start, then refetch
      const timer = setTimeout(() => {
        refetchProcessing();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [wasJustUploaded, refetchProcessing]);

  // Clean up URL parameter once we have processing data
  useEffect(() => {
    if (wasJustUploaded && processing?.processId) {
      const url = new URL(window.location.href);
      url.searchParams.delete("uploaded");
      window.history.replaceState({}, "", url.toString());
    }
  }, [wasJustUploaded, processing?.processId]);

  // Ensure stats has the expected structure
  const hasValidStats =
    stats?.success && stats?.data && typeof stats.data === "object";

  if (statsLoading) {
    return <CardLoading text="Loading your music stats..." height="16rem" />;
  }

  // If we just uploaded, prioritize showing processing status even if no processing data yet
  if (wasJustUploaded && !processing) {
    return (
      <CardLoading
        text="Starting to process your music history..."
        height="16rem"
      />
    );
  }

  // If no stats and no processing, show welcome screen with upload link
  if (!hasValidStats && !processing && !wasJustUploaded) {
    return (
      <motion.div
        className="max-w-3xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Card className="border-dashed border-2">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Music className="h-8 w-8 text-foreground" />
              </div>
              <CardTitle className="text-2xl">
                Welcome to YTMusic Stats! 🎵
              </CardTitle>
              <CardDescription className="text-base">
                Transform your Google Takeout data into beautiful music
                analytics and discover your listening patterns.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="h-10 w-10 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="font-medium">Upload Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Import your YouTube Music history
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="h-10 w-10 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="font-medium">Analyze</h3>
                  <p className="text-sm text-muted-foreground">
                    Get insights into your music taste
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="h-10 w-10 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="font-medium">Discover</h3>
                  <p className="text-sm text-muted-foreground">
                    Explore your listening journey
                  </p>
                </div>
              </div>

              <div className="text-center pt-4">
                <Link href="/upload">
                  <Button size="lg" className="gap-2 px-8">
                    <Upload className="h-4 w-4" />
                    Get Started - Upload Your Data
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-3">
                  Your data is processed locally and securely stored.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  // If processing is ongoing, show processing status
  if (
    processing &&
    processing.processId &&
    (processing.status === "processing" || wasJustUploaded)
  ) {
    return (
      <div className="max-w-2xl mx-auto">
        <ProcessingStatus
          historyId={processing.processId}
          onComplete={async () => {
            // Clear the uploaded param
            const url = new URL(window.location.href);
            url.searchParams.delete("uploaded");
            window.history.replaceState({}, "", url.toString());

            // Invalidate and refetch all relevant queries
            await queryClient.invalidateQueries({ queryKey: ["stats"] });
            await queryClient.invalidateQueries({
              queryKey: ["processing-status"],
            });

            // Force refetch stats to ensure we have the latest data
            await refetchStats();
          }}
        />
      </div>
    );
  }

  // Show loading if we don't have valid stats but processing is complete
  if (!hasValidStats && processing?.status === "completed") {
    return <CardLoading text="Loading your music stats..." height="16rem" />;
  }

  // Show full dashboard
  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header with refresh and status */}
      <motion.div
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Last updated:{" "}
            {stats?.data?.lastUpdated
              ? new Date(stats.data.lastUpdated).toLocaleDateString()
              : "Never"}
          </Badge>
          {stats?.data?.totalSongs &&
            typeof stats.data.totalSongs === "number" && (
              <Badge variant="outline" className="gap-1">
                <Music className="h-3 w-3" />
                {new Intl.NumberFormat().format(stats.data.totalSongs)} songs
                analyzed
              </Badge>
            )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <StatsOverview stats={stats?.data} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="artists" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3 bg-muted">
            {/* <TabsTrigger
              value="overview"
              className="gap-2 data-[state=active]:bg-background"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger> */}
            <TabsTrigger
              value="artists"
              className="gap-2 data-[state=active]:bg-background"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Artists</span>
            </TabsTrigger>
            <TabsTrigger
              value="songs"
              className="gap-2 data-[state=active]:bg-background"
            >
              <Music className="h-4 w-4" />
              <span className="hidden sm:inline">Songs</span>
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="gap-2 data-[state=active]:bg-background"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
          </TabsList>

          {/* <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <TopArtists stats={stats?.data} />
              <TopSongs stats={stats?.data} />
            </div>
          </TabsContent> */}

          <TabsContent value="artists">
            <TopArtists stats={stats?.data} />
          </TabsContent>

          <TabsContent value="songs">
            <TopSongs stats={stats?.data} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <ListeningPatterns stats={stats?.data} />

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Listening Timeline
                  </CardTitle>
                  <CardDescription>
                    Your music journey over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats?.data?.firstPlayDate && (
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">
                        First song played
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(
                          stats.data.firstPlayDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {stats?.data?.lastPlayDate && (
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">
                        Latest activity
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(stats.data.lastPlayDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Discovery rate</span>
                    <span className="text-sm text-muted-foreground">
                      {stats?.data?.newArtistsThisMonth || 0} new artists this
                      month
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Fun Facts
                  </CardTitle>
                  <CardDescription>
                    Interesting stats about your music
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats?.data &&
                    stats.data.totalSongs &&
                    stats.data.totalListens &&
                    stats.data.totalArtists && (
                      <>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium">
                            Average song length
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stats.data.averageSongLength ? (
                              <>
                                {Math.floor(stats.data.averageSongLength / 60)}:
                                {String(
                                  Math.floor(stats.data.averageSongLength % 60)
                                ).padStart(2, "0")}
                              </>
                            ) : (
                              "N/A"
                            )}
                          </p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium">Music variety</p>
                          <p className="text-xs text-muted-foreground">
                            {stats.data.totalSongs &&
                            stats.data.totalListens ? (
                              <>
                                {(
                                  (stats.data.totalSongs /
                                    stats.data.totalListens) *
                                  100
                                ).toFixed(1)}
                                % unique songs
                              </>
                            ) : (
                              "N/A"
                            )}
                          </p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium">
                            Dedication level
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stats.data.totalListens &&
                            stats.data.totalArtists ? (
                              <>
                                {Math.round(
                                  stats.data.totalListens /
                                    stats.data.totalArtists
                                )}{" "}
                                listens per artist
                              </>
                            ) : (
                              "N/A"
                            )}
                          </p>
                        </div>
                      </>
                    )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
