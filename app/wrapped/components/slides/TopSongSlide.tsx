"use client";

import { Clock, Music2, Play, Repeat } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import type { IUserStats } from "@/lib/types/database";

interface TopSongSlideProps {
  stats: IUserStats;
}

export function TopSongSlide({ stats }: TopSongSlideProps) {
  const topSong = stats.topSongs?.[0];
  const topSongs = stats.topSongs?.slice(0, 5) || [];

  if (!topSong) {
    return (
      <div className="max-w-lg mx-auto text-center text-white">
        <p className="text-xl">No song data available</p>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="max-w-lg mx-auto text-center text-white relative h-full max-h-dvh overflow-y-auto py-16 md:py-20 scrollbar-hide px-4">
      {/* Subtle vinyl record decoration */}
      <motion.div
        className="absolute left-1/2 top-32 md:top-40 -translate-x-1/2 w-36 h-36 md:w-48 md:h-48 rounded-full bg-zinc-900/50 -z-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-4 rounded-full border border-white/5" />
        <div className="absolute inset-8 rounded-full border border-white/5" />
        <div className="absolute inset-12 rounded-full border border-white/5" />
        <div className="absolute inset-[45%] rounded-full bg-white/10" />
      </motion.div>

      <motion.p
        className="text-lg text-white/60 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Your #1 song was
      </motion.p>

      {/* Album art */}
      <motion.div
        className="relative mb-4"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 18 }}
      >
        <div className="relative inline-block">
          <motion.div
            className="rounded-2xl"
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
            {topSong.thumbnail ? (
              <Image
                src={topSong.thumbnail}
                alt={topSong.title}
                width={176}
                height={176}
                className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border border-white/10"
                unoptimized
              />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                <Music2 className="h-12 w-12 text-white/40" />
              </div>
            )}
          </motion.div>
          {/* Rank badge */}
          <motion.div
            className="absolute -top-2 -right-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <span className="text-sm font-bold">#1</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Song title and artist */}
      <motion.h2
        className="text-xl md:text-2xl font-bold mb-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {topSong.title}
      </motion.h2>

      <motion.p
        className="text-base text-white/60 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {topSong.artist}
      </motion.p>

      {/* Stats row */}
      <motion.div
        className="grid grid-cols-3 gap-2 mb-6 max-w-xs mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
          <Repeat className="h-3.5 w-3.5 mx-auto mb-1 text-white/50" />
          <p className="text-lg font-bold">
            {topSong.playCount?.toLocaleString()}
          </p>
          <p className="text-[10px] text-white/50">plays</p>
        </div>
        {topSong.duration > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <Play className="h-3.5 w-3.5 mx-auto mb-1 text-white/50" />
            <p className="text-lg font-bold">
              {formatDuration(topSong.duration)}
            </p>
            <p className="text-[10px] text-white/50">length</p>
          </div>
        )}
        {topSong.totalDuration && topSong.totalDuration > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <Clock className="h-3.5 w-3.5 mx-auto mb-1 text-white/50" />
            <p className="text-lg font-bold">
              {formatTotalTime(topSong.totalDuration)}
            </p>
            <p className="text-[10px] text-white/50">total</p>
          </div>
        )}
      </motion.div>

      {/* Other top songs */}
      {topSongs.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-xs text-white/40 mb-3">Also in your top 5</p>
          <div className="space-y-2">
            {topSongs.slice(1).map((song, index) => (
              <motion.div
                key={song.key}
                className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-3 py-2 mx-auto max-w-sm border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: {
                    delay: 0.8 + index * 0.12,
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  },
                }}
                whileHover={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  scale: 1.01,
                }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-white/40 font-medium text-sm w-5">
                  {index + 2}
                </span>
                {song.thumbnail ? (
                  <Image
                    src={song.thumbnail}
                    alt={song.title}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-lg object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                    <Music2 className="h-4 w-4 text-white/40" />
                  </div>
                )}
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium truncate text-sm">{song.title}</p>
                  <p className="text-xs text-white/50 truncate">
                    {song.artist}
                  </p>
                </div>
                <span className="text-xs text-white/40 whitespace-nowrap">
                  {song.playCount}×
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
