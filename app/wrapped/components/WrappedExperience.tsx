"use client";

import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CardLoading } from "@/components/ui/loading";
import type { ApiResponse, IUserStats } from "@/lib/types/database";
import { ProgressBar } from "./ProgressBar";
import { FunFactsSlide } from "./slides/FunFactsSlide";
import { IntroSlide } from "./slides/IntroSlide";
import { ListeningTimeSlide } from "./slides/ListeningTimeSlide";
import { MusicEraSlide } from "./slides/MusicEraSlide";
import { SummarySlide } from "./slides/SummarySlide";
import { TopArtistSlide } from "./slides/TopArtistSlide";
import { TopSongSlide } from "./slides/TopSongSlide";

interface WrappedExperienceProps {
  userId: string;
  userName: string;
}

const AUTOPLAY_DURATION = 6000; // 6 seconds per slide

export function WrappedExperience({
  userId: _userId,
  userName,
}: WrappedExperienceProps) {
  const [stats, setStats] = useState<IUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = 7;

  // Fetch user stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        const data: ApiResponse<IUserStats> = await response.json();
        setStats(data.data || null);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSlides) {
        setIsPaused(true);
        setDirection(index > currentSlide ? 1 : -1);
        setCurrentSlide(index);
      }
    },
    [currentSlide],
  );

  const nextSlide = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (loading || !stats || isPaused) return;

    // Don't autoplay on the last slide
    if (currentSlide >= totalSlides - 1) return;

    autoplayTimerRef.current = setTimeout(() => {
      nextSlide();
    }, AUTOPLAY_DURATION);

    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
    };
  }, [currentSlide, loading, stats, isPaused, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <CardLoading text="Loading your Wrapped..." height="16rem" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="text-center text-white space-y-4">
          <h1 className="text-3xl font-bold">No Data Yet</h1>
          <p className="text-white/80">
            Upload your YouTube Music history to see your Wrapped!
          </p>
          <Link href="/upload">
            <Button variant="secondary" size="lg">
              Upload Data
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "80%" : "-80%",
      opacity: 0,
      scale: 0.95,
      filter: "blur(4px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-80%" : "80%",
      opacity: 0,
      scale: 0.95,
      filter: "blur(4px)",
    }),
  };

  const renderSlide = () => {
    switch (currentSlide) {
      case 0:
        return <IntroSlide userName={userName} stats={stats} />;
      case 1:
        return <ListeningTimeSlide stats={stats} />;
      case 2:
        return <TopArtistSlide stats={stats} />;
      case 3:
        return <TopSongSlide stats={stats} />;
      case 4:
        return <MusicEraSlide stats={stats} />;
      case 5:
        return <FunFactsSlide stats={stats} />;
      case 6:
        return <SummarySlide stats={stats} userName={userName} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      {/* Progress Bar */}
      <ProgressBar
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        onSlideClick={goToSlide}
        autoplayDuration={AUTOPLAY_DURATION}
        isPaused={isPaused}
      />

      {/* Close button */}
      <Link
        href="/dashboard"
        className="absolute top-12 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X className="h-5 w-5 text-white" />
      </Link>

      {/* Main content */}
      <div className="h-screen w-full flex items-center justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 200, damping: 28, mass: 0.8 },
              opacity: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
              scale: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
              filter: { duration: 0.3 },
            }}
            className="w-full h-full flex items-center justify-center px-4"
          >
            {renderSlide()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-40">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 h-10 w-10 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={togglePause}
          className="rounded-full bg-white/20 hover:bg-white/30 text-white h-12 w-12 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          {isPaused ? (
            <Play className="h-5 w-5 ml-0.5" />
          ) : (
            <Pause className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          disabled={currentSlide === totalSlides - 1}
          className="rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 h-10 w-10 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
