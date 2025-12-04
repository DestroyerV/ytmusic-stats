"use client";

import { Calendar, Clock, History } from "lucide-react";
import { motion } from "motion/react";
import type { IUserStats } from "@/lib/types/database";

interface MusicEraSlideProps {
  stats: IUserStats;
}

function getAgeDescription(age: number): string {
  if (age <= 2) return "You're on the cutting edge";
  if (age <= 5) return "Fresh tracks dominate your playlist";
  if (age <= 10) return "A perfect blend of new and classic";
  if (age <= 15) return "You appreciate timeless music";
  if (age <= 20) return "Wonderfully nostalgic taste";
  if (age <= 30) return "Keeping the classics alive";
  return "A true vintage connoisseur";
}

// Timeline visualization
function TimelineVisualization({ averageYear }: { averageYear: number }) {
  const decades = ["1980", "1990", "2000", "2010", "2020"];
  const currentDecade = Math.floor(averageYear / 10) * 10;
  const position = ((averageYear - 1980) / (2030 - 1980)) * 100;

  return (
    <div className="w-full max-w-xs mx-auto my-6">
      <div className="relative h-1.5 bg-white/10 rounded-full overflow-visible">
        {/* Animated fill */}
        <motion.div
          className="absolute left-0 top-0 h-full bg-white/40 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(position, 100)}%` }}
          transition={{ duration: 2, ease: [0.32, 0.72, 0, 1] }}
        />

        {/* Position indicator */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${Math.min(position, 100)}%` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 1.2,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
        >
          <motion.div
            className="w-4 h-4 bg-white rounded-full"
            animate={{
              boxShadow: [
                "0 0 10px rgba(255,255,255,0.3)",
                "0 0 20px rgba(255,255,255,0.5)",
                "0 0 10px rgba(255,255,255,0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>

      {/* Decade markers */}
      <div className="flex justify-between mt-2 text-xs text-white/40">
        {decades.map((decade) => (
          <motion.span
            key={decade}
            className={
              decade === currentDecade.toString()
                ? "text-white font-medium"
                : ""
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            {decade}s
          </motion.span>
        ))}
      </div>
    </div>
  );
}

export function MusicEraSlide({ stats }: MusicEraSlideProps) {
  const listeningAge = stats.listeningAge || 0;
  const musicEra = stats.musicEra || "Unknown";
  const averageYear = stats.averageReleaseYear || new Date().getFullYear();
  const decadeDistribution = stats.decadeDistribution || [];
  const oldestSong = stats.oldestSong;
  const newestSong = stats.newestSong;

  if (!stats.listeningAge && !stats.averageReleaseYear) {
    return (
      <div className="max-w-lg mx-auto text-center text-white">
        <History className="h-16 w-16 mx-auto mb-4 text-white/40" />
        <p className="text-xl text-white/60">
          Not enough data to calculate your music era
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto text-center text-white relative px-4">
      {/* Subtle decorative ring */}
      <motion.div
        className="absolute left-1/2 top-16 -translate-x-1/2 w-40 h-40 rounded-full border border-white/5 -z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      <motion.p
        className="text-lg text-white/60 mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Your music listening age is
      </motion.p>

      {/* Large age number */}
      <motion.div
        className="relative mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <motion.span
          className="text-7xl md:text-8xl font-bold inline-block"
          animate={{
            textShadow: [
              "0 0 20px rgba(255,255,255,0.1)",
              "0 0 40px rgba(255,255,255,0.2)",
              "0 0 20px rgba(255,255,255,0.1)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {listeningAge}
        </motion.span>
        <motion.span
          className="text-2xl text-white/60 ml-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          years
        </motion.span>
      </motion.div>

      {/* Era badge */}
      <motion.div
        className="mb-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-lg font-medium">
          {musicEra}
        </span>
      </motion.div>

      <motion.p
        className="text-sm text-white/50 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {getAgeDescription(listeningAge)}
      </motion.p>

      {/* Timeline visualization */}
      <TimelineVisualization averageYear={averageYear} />

      {/* Stats row */}
      <motion.div
        className="grid grid-cols-2 gap-3 mb-6 max-w-xs mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <Calendar className="h-4 w-4 mx-auto mb-1 text-white/50" />
          <p className="text-lg font-bold">{averageYear}</p>
          <p className="text-[10px] text-white/50">avg. release year</p>
        </div>
        {stats.songsWithYearCount && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <Clock className="h-4 w-4 mx-auto mb-1 text-white/50" />
            <p className="text-lg font-bold">{stats.songsWithYearCount}</p>
            <p className="text-[10px] text-white/50">songs analyzed</p>
          </div>
        )}
      </motion.div>

      {/* Oldest & Newest songs */}
      {(oldestSong || newestSong) && (
        <motion.div
          className="grid grid-cols-2 gap-3 mb-6 max-w-sm mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {oldestSong && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 text-left">
              <p className="text-[10px] text-white/40 mb-1">Oldest track</p>
              <p className="text-sm font-medium truncate">{oldestSong.title}</p>
              <p className="text-xs text-white/50 truncate">
                {oldestSong.artist} • {oldestSong.year}
              </p>
            </div>
          )}
          {newestSong && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 text-left">
              <p className="text-[10px] text-white/40 mb-1">Newest track</p>
              <p className="text-sm font-medium truncate">{newestSong.title}</p>
              <p className="text-xs text-white/50 truncate">
                {newestSong.artist} • {newestSong.year}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Decade distribution */}
      {decadeDistribution.length > 0 && (
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <p className="text-xs text-white/40 mb-3">Decade breakdown</p>
          <div className="space-y-2 max-w-xs mx-auto">
            {decadeDistribution.slice(0, 4).map((item, index) => (
              <motion.div
                key={item.decade}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                <span className="text-xs text-white/60 w-12 text-left">
                  {item.decade}
                </span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white/50 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{
                      delay: 1.2 + index * 0.12,
                      duration: 0.8,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                  />
                </div>
                <span className="text-xs text-white/40 w-8 text-right">
                  {item.percentage}%
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
