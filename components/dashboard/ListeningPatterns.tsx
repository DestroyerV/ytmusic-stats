"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Clock,
  Calendar,
  Headphones,
  Music,
  BarChart3,
} from "lucide-react";

interface ListeningPatternsProps {
  stats?: any;
}

export function ListeningPatterns({ stats }: ListeningPatternsProps) {
  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Listening Patterns
          </CardTitle>
          <CardDescription>
            Analyze your music consumption habits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pattern data available yet.</p>
            <p className="text-xs mt-1">
              Upload your music history to see your listening patterns!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

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

  // Calculate some interesting patterns
  const averageSessionLength = (stats.totalPlaytime / stats.totalListens) * 60; // in seconds
  const varietyScore = (stats.totalSongs / stats.totalListens) * 100;
  const repeatRate =
    ((stats.totalListens - stats.totalSongs) / stats.totalListens) * 100;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Listening Habits
          </CardTitle>
          <CardDescription>Your music consumption patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Music Variety</span>
              <Badge variant="secondary">{varietyScore.toFixed(1)}%</Badge>
            </div>
            <Progress value={varietyScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              How often you listen to unique songs vs repeats
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Repeat Rate</span>
              <Badge variant="secondary">{repeatRate.toFixed(1)}%</Badge>
            </div>
            <Progress value={repeatRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Percentage of songs you've played more than once
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Session</span>
              <Badge variant="secondary">
                {formatDuration(averageSessionLength)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Average length of continuous listening
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Insights
          </CardTitle>
          <CardDescription>When and how you listen to music</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold">
                {formatDuration(stats.dailyAveragePlaytime)}
              </div>
              <p className="text-xs text-muted-foreground">Daily Average</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold">
                {formatNumber(Math.round(stats.dailyAverageListens))}
              </div>
              <p className="text-xs text-muted-foreground">Songs/Day</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Longest Session</span>
              <span className="text-sm text-muted-foreground">
                {formatDuration(stats.longestSession)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Most Active Day</span>
              <span className="text-sm text-muted-foreground">
                {formatDuration(stats.longestListenDayDuration)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
