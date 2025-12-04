"use client";

import { Info, Play, Upload } from "lucide-react";
import { motion, type Variants } from "motion/react";
import { UploadArea } from "@/app/upload/components/upload-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
    },
  },
};

interface UploadContentProps {
  userName?: string;
}

export function UploadContent({ userName }: UploadContentProps) {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div
        className="mb-6 sm:mb-8 space-y-3 sm:space-y-4"
        variants={itemVariants}
      >
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
            <div className="h-6 sm:h-8 w-1 bg-foreground rounded-full" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Upload Music History
            </h1>
          </div>
          <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Transform your Google Takeout data into beautiful analytics. Upload
            your YouTube Music listening history to discover patterns, insights,
            and your musical journey.
          </p>
          {userName && (
            <p className="text-xs sm:text-sm text-muted-foreground/80 mt-2 sm:mt-3">
              Ready to analyze your data, {userName}! 🎵
            </p>
          )}
        </div>
      </motion.div>

      <motion.div
        className="max-w-3xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0"
        variants={itemVariants}
      >
        {/* Upload New Data */}
        <Card className="border-dashed border-2 hover:shadow-md transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-3 mb-4">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Info className="h-3 w-3 sm:h-4 sm:w-4 text-foreground" />
              </div>
              <div>
                <p className="font-medium mb-1 text-sm sm:text-base">
                  Data Replacement Policy
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  New uploads automatically replace existing data to ensure you
                  always see your most current statistics.
                </p>
              </div>
            </div>
            <UploadArea />
          </CardContent>
        </Card>
      </motion.div>

      {/* Instructions */}
      <motion.div
        className="mt-8 sm:mt-12 max-w-4xl mx-auto px-4 sm:px-0"
        variants={itemVariants}
      >
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            How to Get Your Data
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Follow these simple steps to download your YouTube Music history
            from Google
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "1",
              title: "Visit Google Takeout",
              description:
                "Go to takeout.google.com and sign in with your Google account",
              link: "takeout.google.com ↗",
              url: "https://takeout.google.com",
            },
            {
              step: "2",
              title: "Select YouTube Data",
              description:
                "Choose 'YouTube and YouTube Music' from the list of products to export",
              link: null,
              url: null,
            },
            {
              step: "3",
              title: "Choose Format",
              description:
                "Select JSON format and create your export. This may take some time.",
              link: null,
              url: null,
            },
            {
              step: "4",
              title: "Download & Upload",
              description:
                "Once ready, download the files and upload the watch-history.json here",
              link: null,
              url: null,
            },
          ].map((step, index) => (
            <motion.div
              key={step.step}
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: {
                    duration: 0.6,
                    delay: index * 0.1,
                  },
                },
              }}
            >
              <Card className="text-center hover:shadow-md transition-all duration-300 group h-full">
                <CardContent className="p-4 sm:p-6">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-muted mx-auto mb-3 sm:mb-4 flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                    <span className="text-lg sm:text-xl font-bold text-foreground">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                    {step.description}
                  </p>
                  {step.link && step.url && (
                    <a
                      href={step.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-foreground underline hover:no-underline transition-all"
                    >
                      {step.link}
                    </a>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Video Tutorial */}
      <motion.div
        className="mt-8 sm:mt-12 max-w-4xl mx-auto px-4 sm:px-0"
        variants={itemVariants}
      >
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <Play className="h-5 w-5 sm:h-6 sm:w-6" />
            Video Tutorial
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Watch this step-by-step guide to download your Google Takeout data
          </p>
        </div>

        <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
          <CardContent className="p-0">
            <div className="relative w-full aspect-video bg-muted">
              {/** biome-ignore lint/a11y/useMediaCaption: tutorial video with visual instructions only */}
              <video
                className="absolute inset-0 w-full h-full"
                src="/google-takeout-tutorial.mp4"
                title="How to Get Google Takeout Data for YouTube Music"
                controls
                preload="metadata"
                playsInline
              ></video>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs sm:text-sm text-muted-foreground text-center mt-4">
          Having trouble? Follow the written instructions above or reach out for
          help.
        </p>
      </motion.div>

      {/* Pro Tips */}
      <motion.div
        className="mt-8 sm:mt-12 px-4 sm:px-0"
        variants={itemVariants}
      >
        <Card className="bg-muted/30">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
              Pro Tips for Better Results
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Get the most out of your music analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium text-sm sm:text-base">
                  📁 File Requirements
                </h4>
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <li>
                    • Upload the 'watch-history.json' file from your Google
                    Takeout
                  </li>
                  <li>• File should be in JSON format (not HTML)</li>
                  <li>• Maximum file size: 100MB</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm sm:text-base">
                  🎵 Data Quality
                </h4>
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <li>• More listening history = better insights</li>
                  <li>• Include at least 3 months of data for trends</li>
                  <li>• Regular uploads keep your stats current</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm sm:text-base">
                  🔒 Privacy & Security
                </h4>
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <li>• Your data is processed securely</li>
                  <li>• No personal information is stored</li>
                  <li>• Only you can see your statistics</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm sm:text-base">
                  📊 What You'll Get
                </h4>
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <li>• Top artists and songs</li>
                  <li>• Listening patterns and trends</li>
                  <li>• Music discovery insights</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
