"use client";

import { Calendar, Clock, Headphones } from "lucide-react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import type { IUserStats } from "@/lib/types/database";

interface ListeningTimeSlideProps {
  stats: IUserStats;
}

function AnimatedNumber({
  value,
  duration = 2.5,
  delay = 0,
}: {
  value: number;
  duration?: number;
  delay?: number;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setHasStarted(true);
      const controls = animate(count, value, {
        duration,
        ease: [0.32, 0.72, 0, 1], // Smooth ease-out curve for natural deceleration
        onComplete: () => setHasFinished(true),
      });
      const unsubscribe = rounded.on("change", (v) => setDisplayValue(v));

      return () => {
        controls.stop();
        unsubscribe();
      };
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [count, rounded, value, duration, delay]);

  return (
    <motion.span
      className="inline-block tabular-nums"
      initial={{ opacity: 0, filter: "blur(4px)" }}
      animate={hasStarted ? { opacity: 1, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.span
        initial={{ scale: 1 }}
        animate={hasFinished ? { scale: [1.05, 1] } : {}}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {displayValue.toLocaleString()}
      </motion.span>
    </motion.span>
  );
}

// Animated sound wave bars
function SoundBars() {
  const bars = [0, 1, 2, 3, 4, 5, 6];
  const heights = [
    [8, 20, 12, 28, 8],
    [12, 28, 8, 20, 12],
    [20, 12, 28, 8, 20],
    [8, 32, 16, 24, 8],
    [16, 8, 24, 32, 16],
    [24, 16, 8, 20, 24],
    [12, 24, 20, 8, 12],
  ];

  return (
    <div className="flex items-center justify-center gap-1 h-10">
      {bars.map((i) => (
        <motion.div
          key={`bar-${i}`}
          className="w-1 bg-white/40 rounded-full"
          animate={{
            height: heights[i],
          }}
          transition={{
            duration: 1.4,
            delay: i * 0.06,
            repeat: Infinity,
            ease: [0.45, 0.05, 0.55, 0.95], // Smooth sine-like easing
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
}

// Circular progress ring
function TimeRing({ hours }: { hours: number }) {
  const maxHours = 8760; // Hours in a year
  const percentage = Math.min((hours / maxHours) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-24 h-24 md:w-28 md:h-28 -rotate-90" aria-hidden="true">
        {/* Background circle */}
        <circle
          cx="50%"
          cy="50%"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="6"
        />
        {/* Progress circle */}
        <motion.circle
          cx="50%"
          cy="50%"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2.5, delay: 0.5, ease: [0.32, 0.72, 0, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Headphones className="h-10 w-10 md:h-12 md:w-12 text-white" />
        </motion.div>
      </div>
    </div>
  );
}

export function ListeningTimeSlide({ stats }: ListeningTimeSlideProps) {
  const totalMinutes = Math.round((stats.totalPlaytime || 0) / 60);
  const totalHours = Math.round(totalMinutes / 60);
  const totalDays = (totalHours / 24).toFixed(1);

  // Daily average from stats or calculate
  const dailyAvgMinutes = Math.round((stats.dailyAveragePlaytime || 0) / 60);
  const dailyAvgHours = (dailyAvgMinutes / 60).toFixed(1);

  // Fun comparisons
  const moviesWatched = Math.round(totalHours / 2);
  const podcastEpisodes = Math.round(totalHours); // ~1 hour per episode
  const albumsPlayed = Math.round(totalMinutes / 45); // ~45 min per album

  return (
    <div className="max-w-lg mx-auto text-center text-white relative px-4">
      {/* Time ring with icon */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <TimeRing hours={totalHours} />
      </motion.div>

      <motion.p
        className="text-lg text-white/60 mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        You spent
      </motion.p>

      <motion.div
        className="mb-2"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <span className="text-6xl md:text-8xl font-bold inline-block">
          <AnimatedNumber value={totalHours} duration={2.5} delay={0.4} />
        </span>
        <motion.span
          className="text-2xl md:text-3xl font-medium ml-2 text-white/80"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          hours
        </motion.span>
      </motion.div>

      <motion.p
        className="text-lg text-white/60 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        listening to music
      </motion.p>

      {/* Sound bars animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mb-6"
      >
        <SoundBars />
      </motion.div>

      {/* Stats grid */}
      <motion.div
        className="grid grid-cols-3 gap-3 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10"
          whileHover={{
            scale: 1.03,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Calendar className="h-4 w-4 mx-auto mb-1 text-white/50" />
          <p className="text-xl font-bold">{totalDays}</p>
          <p className="text-xs text-white/50">days</p>
        </motion.div>
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10"
          whileHover={{
            scale: 1.03,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Clock className="h-4 w-4 mx-auto mb-1 text-white/50" />
          <p className="text-xl font-bold">{totalMinutes.toLocaleString()}</p>
          <p className="text-xs text-white/50">minutes</p>
        </motion.div>
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10"
          whileHover={{
            scale: 1.03,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Headphones className="h-4 w-4 mx-auto mb-1 text-white/50" />
          <p className="text-xl font-bold">{dailyAvgHours}</p>
          <p className="text-xs text-white/50">hrs/day avg</p>
        </motion.div>
      </motion.div>

      {/* Fun comparisons */}
      <motion.div
        className="space-y-2 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <p className="text-white/40">That&apos;s equivalent to...</p>
        <motion.div
          className="flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
            🎬 {moviesWatched} movies
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
            💿 {albumsPlayed} albums
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
            🎙️ {podcastEpisodes} podcast episodes
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
