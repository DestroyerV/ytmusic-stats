"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IUserStats } from "@/lib/types/database";
import {
  Music,
  Clock,
  Calendar,
  TrendingUp,
  Users,
  Headphones,
  Star,
  Zap,
} from "lucide-react";

interface StatsOverviewProps {
  stats: IUserStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h ${minutes}m`;
    }

    return `${hours}h ${minutes}m`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(dateObj);
  };

  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listens</CardTitle>
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
              <Music className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats.totalListens)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(stats.totalSongs)} unique songs
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Playtime
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
              <Clock className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(stats.totalPlaytime)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDuration(stats.monthlyPlaytime)} this month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
              <Calendar className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(Math.round(stats.dailyAverageListens))}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDuration(Math.round(stats.dailyAveragePlaytime))} per day
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artists</CardTitle>
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
              <Users className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats.totalArtists)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.newArtistsThisMonth} new this month
            </p>
          </CardContent>
        </Card>
        {/* </div> */}

        {/* Secondary Stats */}
        {/* <div className="grid gap-4 md:grid-cols-3"> */}
        <Card className="hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Longest Day</CardTitle>
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
              <Star className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(stats.longestListenDayDuration)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.longestListenDay
                ? formatDate(stats.longestListenDay)
                : "No data available"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Longest Session
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
              <Headphones className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(stats.longestSession)}
            </div>
            <p className="text-xs text-muted-foreground">
              Continuous listening record
            </p>
          </CardContent>
        </Card>

        {/* <Card className="hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Song</CardTitle>
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
              <Zap className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.topSongs[0]?.playCount || 0}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {stats.topSongs[0]
                ? `${stats.topSongs[0].title}`
                : "No data available"}
            </p>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
