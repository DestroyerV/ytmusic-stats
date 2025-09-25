"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Play, Music } from "lucide-react";

interface TopArtistsProps {
  stats?: any;
}

export function TopArtists({ stats }: TopArtistsProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getArtistInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const topArtists = stats?.topArtists || [];
  const maxPlayCount = topArtists[0]?.playCount || 1;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <Users className="h-4 w-4 text-foreground" />
          </div>
          Top Artists
        </CardTitle>
        <CardDescription>Your most played artists of all time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topArtists.slice(0, 10).map((artist: any, index: number) => (
            <div
              key={artist.name}
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

              <Avatar className="h-10 w-10">
                <AvatarFallback
                  className={`text-sm font-semibold ${
                    index === 0
                      ? "bg-foreground text-background"
                      : index === 1
                      ? "bg-muted-foreground text-background"
                      : index === 2
                      ? "bg-muted-foreground/80 text-background"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {getArtistInitials(artist.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium leading-none truncate text-sm">
                    {artist.name}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <Play className="h-3 w-3" />
                    {formatNumber(artist.playCount)}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <span>{formatNumber(artist.uniqueSongs)} songs</span>
                    <span>•</span>
                    <span>{formatDuration(artist.totalDuration)}</span>
                  </div>
                </div>

                <Progress
                  value={(artist.playCount / maxPlayCount) * 100}
                  className="h-1.5"
                />
              </div>
            </div>
          ))}

          {topArtists.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No artist data available yet.</p>
              <p className="text-xs mt-1">
                Upload your music history to see your top artists!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
