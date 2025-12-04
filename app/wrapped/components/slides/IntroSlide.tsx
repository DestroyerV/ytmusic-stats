"use client";

import { Music } from "lucide-react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type { IUserStats } from "@/lib/types/database";

interface IntroSlideProps {
  userName: string;
  stats: IUserStats;
}

function AnimatedNumber({
  value,
  duration = 2,
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
        ease: [0.32, 0.72, 0, 1], // Smooth ease-out curve
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
      initial={{ opacity: 0, y: 10 }}
      animate={hasStarted ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.span
        initial={{ scale: 1 }}
        animate={hasFinished ? { scale: [1.08, 1] } : {}}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {displayValue.toLocaleString()}
      </motion.span>
    </motion.span>
  );
}

// Floating music notes background
function FloatingNotes() {
  const notes = useMemo(() => ["♪", "♫", "♬", "♩"], []);
  const particles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        note: notes[i % notes.length],
        initialX: Math.random() * 100 - 50,
        duration: 5 + Math.random() * 3,
        delay: Math.random() * 2,
        size: 14 + Math.random() * 10,
      })),
    [notes],
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute text-white/10"
          style={{
            left: `${50 + p.initialX * 0.5}%`,
            fontSize: p.size,
          }}
          initial={{ y: "100vh", opacity: 0, rotate: -20 }}
          animate={{
            y: "-20vh",
            opacity: [0, 0.3, 0.3, 0],
            rotate: 20,
            x: [0, p.initialX * 0.3, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: [0.45, 0.05, 0.55, 0.95], // Smooth sine-like curve
          }}
        >
          {p.note}
        </motion.div>
      ))}
    </div>
  );
}

// Animated vinyl record
function VinylRecord() {
  return (
    <div className="relative inline-block">
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: [
            "0 0 30px rgba(255, 255, 255, 0.1)",
            "0 0 50px rgba(255, 255, 255, 0.2)",
            "0 0 30px rgba(255, 255, 255, 0.1)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Vinyl disc */}
      <motion.div
        className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-zinc-900 flex items-center justify-center border-2 border-zinc-700"
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      >
        {/* Grooves */}
        <div className="absolute inset-3 rounded-full border border-zinc-700/50" />
        <div className="absolute inset-6 rounded-full border border-zinc-700/50" />
        <div className="absolute inset-9 rounded-full border border-zinc-700/50" />

        {/* Center label */}
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
          <Music className="h-6 w-6 md:h-7 md:w-7 text-white" />
        </div>
      </motion.div>
    </div>
  );
}

// Typing animation for the greeting
function TypedText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          setTimeout(() => setShowCursor(false), 600);
        }
      }, 60); // Faster, smoother typing

      return () => clearInterval(interval);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <span>
      {displayedText}
      {showCursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-[3px] h-[1em] bg-white ml-1 align-middle"
        />
      )}
    </span>
  );
}

export function IntroSlide({ userName, stats }: IntroSlideProps) {
  const year = new Date().getFullYear();
  const totalHours = Math.round((stats.totalPlaytime || 0) / 3600);

  return (
    <div className="max-w-xl mx-auto text-center text-white relative px-4">
      {/* Floating notes background */}
      <FloatingNotes />

      {/* Subtle background glow */}
      <motion.div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* Year badge */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="mb-6"
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/80 backdrop-blur-sm">
          Your {year} Wrapped
        </span>
      </motion.div>

      {/* Vinyl record animation */}
      <motion.div
        initial={{ scale: 0, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
        className="mb-8"
      >
        <VinylRecord />
      </motion.div>

      {/* Main greeting */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-2"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          <TypedText text={`Hey, ${userName}!`} delay={0.5} />
        </h1>
      </motion.div>

      <motion.p
        className="text-lg md:text-xl text-white/60 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        Ready to relive your musical journey?
      </motion.p>

      {/* Stats preview cards */}
      <motion.div
        className="grid grid-cols-3 gap-3 mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
          whileHover={{
            scale: 1.05,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <p className="text-2xl md:text-3xl font-bold text-white">
            <AnimatedNumber
              value={stats.totalSongs || 0}
              duration={1.8}
              delay={2}
            />
          </p>
          <p className="text-xs md:text-sm text-white/50 mt-1">songs</p>
        </motion.div>

        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
          whileHover={{
            scale: 1.05,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <p className="text-2xl md:text-3xl font-bold text-white">
            <AnimatedNumber
              value={stats.totalArtists || 0}
              duration={1.5}
              delay={2.2}
            />
          </p>
          <p className="text-xs md:text-sm text-white/50 mt-1">artists</p>
        </motion.div>

        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
          whileHover={{
            scale: 1.05,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <p className="text-2xl md:text-3xl font-bold text-white">
            <AnimatedNumber value={totalHours} duration={1.5} delay={2.4} />
          </p>
          <p className="text-xs md:text-sm text-white/50 mt-1">hours</p>
        </motion.div>
      </motion.div>

      {/* Teaser text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        className="flex items-center justify-center gap-2 text-white/40 text-sm"
      >
        <motion.span
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ↓
        </motion.span>
        <span>Swipe to discover your music story</span>
        <motion.span
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ↓
        </motion.span>
      </motion.div>
    </div>
  );
}
