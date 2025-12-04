"use client";

import { Music, Play } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { IUserStats } from "@/lib/types/database";

interface TopSongsProps {
  stats?: IUserStats;
}

export function TopSongs({ stats }: TopSongsProps) {
  const formatDuration = (seconds: number) => {
    if (!seconds || !Number.isFinite(seconds) || seconds < 0) {
      return "0:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const topSongs = stats?.topSongs || [];
  const maxPlayCount = topSongs[0]?.playCount || 1;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <Music className="h-4 w-4 text-foreground" />
          </div>
          Top Songs
        </CardTitle>
        <CardDescription>Your most played tracks of all time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topSongs.slice(0, 10).map((song, index) => (
            <div
              key={
                song.key ||
                song.youtubeId ||
                `${song.artist}-${song.title}-${index}`
              }
              className="group flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                  index === 0
                    ? "bg-foreground text-background"
                    : index === 1
                      ? "bg-muted-foreground text-background"
                      : index === 2
                        ? "bg-muted-foreground/80 text-background"
                        : "bg-muted text-foreground"
                }`}
              >
                {index + 1}
              </div>

              <Avatar className="h-10 w-10 rounded-md">
                {song.thumbnail ? (
                  <AvatarImage
                    src={song.thumbnail}
                    alt={song.title}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback
                  className={`rounded-md ${
                    index === 0
                      ? "bg-foreground text-background"
                      : index === 1
                        ? "bg-muted-foreground text-background"
                        : index === 2
                          ? "bg-muted-foreground/80 text-background"
                          : "bg-muted text-foreground"
                  }`}
                >
                  <Music className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="font-medium leading-none truncate text-sm">
                      {song.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {song.artist}
                    </p>
                  </div>
                  <div className="text-right space-y-0.5 ml-3">
                    <div className="flex items-center gap-1 text-xs font-medium">
                      <Play className="h-3 w-3" />
                      {formatNumber(song.playCount || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDuration(song.duration || 0)}
                    </div>
                  </div>
                </div>

                <Progress
                  value={((song.playCount || 0) / maxPlayCount) * 100}
                  className="h-1.5"
                />
              </div>
            </div>
          ))}

          {topSongs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No song data available yet.</p>
              <p className="text-xs mt-1">
                Upload your music history to see your top tracks!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
