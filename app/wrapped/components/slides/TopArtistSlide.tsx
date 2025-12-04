"use client";

import { Clock, Crown, Music, Play } from "lucide-react";
import { motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { IUserStats } from "@/lib/types/database";

interface TopArtistSlideProps {
  stats: IUserStats;
}

export function TopArtistSlide({ stats }: TopArtistSlideProps) {
  const topArtist = stats.topArtists?.[0];
  const topArtists = stats.topArtists?.slice(0, 5) || [];

  if (!topArtist) {
    return (
      <div className="max-w-lg mx-auto text-center text-white">
        <p className="text-xl">No artist data available</p>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate percentage of total listening time
  const totalPlaytime = stats.totalPlaytime || 1;
  const artistPercentage = Math.round(
    (topArtist.totalDuration / totalPlaytime) * 100,
  );

  return (
    <div className="max-w-lg mx-auto text-center text-white relative px-4">
      {/* Subtle pulsing rings */}
      <div className="absolute left-1/2 top-[140px] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
            style={{ width: 180, height: 180 }}
            animate={{
              scale: [1, 1.8],
              opacity: [0.3, 0],
            }}
            transition={{
              duration: 3.5,
              delay: i * 1.1,
              repeat: Infinity,
              ease: [0.32, 0.72, 0, 1], // Smooth deceleration
            }}
          />
        ))}
      </div>

      <motion.p
        className="text-lg text-white/60 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Your #1 artist was
      </motion.p>

      {/* Main artist avatar */}
      <motion.div
        className="relative mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <div className="relative inline-block">
          <motion.div
            className="rounded-full"
            animate={{
              boxShadow: [
                "0 0 20px rgba(255,255,255,0.1)",
                "0 0 40px rgba(255,255,255,0.2)",
                "0 0 20px rgba(255,255,255,0.1)",
              ],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: [0.45, 0.05, 0.55, 0.95],
            }}
          >
            <Avatar className="w-28 h-28 md:w-36 md:h-36 border-2 border-white/20">
              {topArtist.artistImage ? (
                <AvatarImage src={topArtist.artistImage} alt={topArtist.name} />
              ) : null}
              <AvatarFallback className="text-3xl font-bold bg-white/10 text-white">
                {getInitials(topArtist.name)}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          {/* Crown badge */}
          <motion.div
            className="absolute -top-2 -right-2"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <motion.div
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
              animate={{
                boxShadow: [
                  "0 0 10px rgba(255,255,255,0.1)",
                  "0 0 20px rgba(255,255,255,0.2)",
                  "0 0 10px rgba(255,255,255,0.1)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Crown className="h-5 w-5 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Artist name */}
      <motion.h2
        className="text-3xl md:text-4xl font-bold mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {topArtist.name}
      </motion.h2>

      {/* Percentage badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-white/70">
          {artistPercentage}% of your listening time
        </span>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        className="grid grid-cols-3 gap-3 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10"
          whileHover={{
            scale: 1.03,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Play className="h-4 w-4 mx-auto mb-1 text-white/50" />
          <p className="text-xl font-bold">
            {topArtist.playCount.toLocaleString()}
          </p>
          <p className="text-xs text-white/50">plays</p>
        </motion.div>
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10"
          whileHover={{
            scale: 1.03,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Clock className="h-4 w-4 mx-auto mb-1 text-white/50" />
          <p className="text-xl font-bold">
            {formatDuration(topArtist.totalDuration)}
          </p>
          <p className="text-xs text-white/50">listened</p>
        </motion.div>
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10"
          whileHover={{
            scale: 1.03,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Music className="h-4 w-4 mx-auto mb-1 text-white/50" />
          <p className="text-xl font-bold">{topArtist.uniqueSongs}</p>
          <p className="text-xs text-white/50">songs</p>
        </motion.div>
      </motion.div>

      {/* Runner-up artists */}
      {topArtists.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.7,
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <p className="text-sm text-white/40 mb-3">Also in your top 5</p>
          <div className="flex justify-center items-center gap-3">
            {topArtists.slice(1).map((artist, index) => (
              <motion.div
                key={artist.name}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.85 + index * 0.1,
                  type: "spring",
                  stiffness: 180,
                  damping: 18,
                }}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12 border border-white/10">
                    {artist.artistImage ? (
                      <AvatarImage src={artist.artistImage} alt={artist.name} />
                    ) : null}
                    <AvatarFallback className="text-xs font-medium bg-white/5 text-white/70">
                      {getInitials(artist.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] font-medium">
                    {index + 2}
                  </span>
                </div>
                <p className="text-xs text-white/60 mt-2 max-w-[60px] truncate">
                  {artist.name}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
