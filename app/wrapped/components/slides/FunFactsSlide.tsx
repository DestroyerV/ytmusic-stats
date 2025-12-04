"use client";

import {
  Calendar,
  Clock,
  Flame,
  Headphones,
  Play,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import type { IUserStats } from "@/lib/types/database";

interface FunFactsSlideProps {
  stats: IUserStats;
}

interface FactCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  delay: number;
}

function FactCard({ icon, title, value, description, delay }: FactCardProps) {
  return (
    <motion.div
      className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay,
        type: "spring",
        stiffness: 180,
        damping: 20,
        mass: 0.8,
      }}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.08)", scale: 1.01 }}
    >
      <div className="flex items-start gap-3">
        <motion.div
          className="p-2 rounded-lg bg-white/5 border border-white/10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.1, type: "spring", stiffness: 250 }}
        >
          {icon}
        </motion.div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs text-white/50">{title}</p>
          <motion.p
            className="text-lg font-bold truncate"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: delay + 0.15,
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            {value}
          </motion.p>
          <p className="text-[11px] text-white/40 mt-0.5">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function FunFactsSlide({ stats }: FunFactsSlideProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const facts = [
    {
      icon: <Flame className="h-4 w-4 text-white/70" />,
      title: "Longest session",
      value: formatDuration(stats.longestSession || 0),
      description: "Your marathon listening moment",
      show: (stats.longestSession || 0) > 0,
    },
    {
      icon: <Calendar className="h-4 w-4 text-white/70" />,
      title: "Biggest music day",
      value: formatDate(stats.longestListenDay),
      description: `${formatDuration(stats.longestListenDayDuration || 0)} of music`,
      show: !!stats.longestListenDay,
    },
    {
      icon: <Clock className="h-4 w-4 text-white/70" />,
      title: "Daily average",
      value: `${Math.round(stats.dailyAverageListens || 0)} songs`,
      description: `${formatDuration(stats.dailyAveragePlaytime || 0)} per day`,
      show: (stats.dailyAverageListens || 0) > 0,
    },
    {
      icon: <TrendingUp className="h-4 w-4 text-white/70" />,
      title: "Artists discovered",
      value: `${stats.totalNewArtists || stats.totalArtists || 0}`,
      description: "Unique artists in your library",
      show: (stats.totalNewArtists || stats.totalArtists || 0) > 0,
    },
    {
      icon: <Play className="h-4 w-4 text-white/70" />,
      title: "Total listens",
      value: (stats.totalListens || 0).toLocaleString(),
      description: "Times you pressed play",
      show: (stats.totalListens || 0) > 0,
    },
    {
      icon: <Headphones className="h-4 w-4 text-white/70" />,
      title: "Average song length",
      value: formatDuration(stats.averageSongLength || 0),
      description: "Typical track duration",
      show: (stats.averageSongLength || 0) > 0,
    },
  ].filter((fact) => fact.show);

  return (
    <div className="max-w-lg mx-auto text-center text-white relative h-full max-h-dvh overflow-y-auto py-16 md:py-20 scrollbar-hide px-4">
      {/* Header */}
      <motion.div
        className="flex items-center justify-center gap-2 mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Sparkles className="h-5 w-5 text-white/60" />
        <h2 className="text-2xl md:text-3xl font-bold">Fun Facts</h2>
      </motion.div>

      <motion.p
        className="text-white/50 mb-6 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        Interesting stats about your listening habits
      </motion.p>

      {/* Facts grid */}
      <div className="grid gap-2.5">
        {facts.slice(0, 6).map((fact, index) => (
          <FactCard
            key={fact.title}
            icon={fact.icon}
            title={fact.title}
            value={fact.value}
            description={fact.description}
            delay={0.2 + index * 0.08}
          />
        ))}
      </div>

      {/* Journey start date */}
      {stats.firstPlayDate && (
        <motion.div
          className="mt-6 py-3 px-4 rounded-xl bg-white/5 border border-white/10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.8,
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <p className="text-xs text-white/40 mb-1">Your journey began</p>
          <motion.p
            className="text-lg font-medium"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 1,
              type: "spring",
              stiffness: 180,
              damping: 15,
            }}
          >
            {new Date(stats.firstPlayDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </motion.p>
        </motion.div>
      )}
    </div>
  );
}
