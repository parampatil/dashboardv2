"use client";
import { motion } from "framer-motion";
import { Notebook, Clock, Rocket, Wand2, Bug } from "lucide-react";

const updates = [
  {
    id: 8,
    date: "2025-06-29",
    title: "Affiliate Onboarding",
    icon: <Notebook className="w-4 h-4" />,
    color: "text-orange-500",
    description: "Affiliate Onboarding flow completed",
    bulletPoints: [
      "Added affiliate request form",
      "Implemented admin approval workflow",
    ],
  },
  {
    id: 7,
    date: "2025-06-25",
    title: "New Signup Flow",
    icon: <Rocket className="w-4 h-4" />,
    color: "text-blue-500",
    description: "Improved user onboarding experience",
    bulletPoints: [
      "Simplified registration process with invitations",
      "Added admin verification step before onboarding users",
      "Enhanced UI for: Login, Invitations",
      "Deny list issue fixed: fetches correct data from right environment",
    ],
  },
  {
    id: 6,
    date: "2025-06-17",
    title: "Demo Globe Update",
    icon: <Bug className="w-4 h-4" />,
    color: "text-purple-500",
    description: "Made the glob spin faster",
    bulletPoints: [],
  },
  {
    id: 5,
    date: "2025-06-12",
    title: "User Stats Update",
    icon: <Rocket className="w-4 h-4" />,
    color: "text-blue-500",
    description: "New metrics added to user statistics",
    bulletPoints: [
      "Added total users count",
      "Added 360 users count",
      "Added non-360 users count",
    ],
  },
  {
    id: 4,
    date: "2025-06-09",
    title: "New Features and Fixes",
    icon: <Notebook className="w-4 h-4" />,
    color: "text-orange-500",
    description: "Updates to enhance user experience",
    bulletPoints: [
      "Added refresh trigger when switching between environments",
      "Added All options for page size selector in users table",
    ],
  },
  {
    id: 3,
    date: "2025-06-07",
    title: "System Enhancements",
    icon: <Rocket className="w-4 h-4" />,
    color: "text-blue-500",
    bulletPoints: [
      "Added total metrics for 360/non-360 users",
      "Updated API for environment-selector, (dev, preprod are now available)",
      "Revised call charge calculations in history table",
      "Reorganized sales dashboard layout",
      "Improved button visibility in users table",
    ],
  },
  {
    id: 2,
    date: "2025-06-05",
    title: "Map Visualization Update",
    icon: <Bug className="w-4 h-4" />,
    color: "text-purple-500",
    description: "Improved data representation on the demo globe",
    bulletPoints: ["Replaced Users with bubbles"],
  },
  {
    id: 1,
    date: "2025-06-01",
    title: "Data Management Features",
    icon: <Wand2 className="w-4 h-4" />,
    color: "text-green-500",
    description: "Enhanced data integrity controls",
    bulletPoints: [
      "Soft delete/restore functionality added",
      "New sidebar UI implemented",
    ],
  },
];

export default function UpdatesTimeline() {
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // Variants for staggered animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="w-full mx-auto px-4">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <Clock className="text-orange-500" />
        Release Timeline
      </h2>

      <motion.div
        className="relative"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Timeline line */}
        <div className="absolute left-4 md:left-5 top-0 w-0.5 h-full bg-gradient-to-b from-blue-100 to-purple-100" />

        {updates.map((update) => (
          <motion.div
            key={update.id}
            variants={item}
            className="relative pl-12 md:pl-16 mb-8 group"
          >
            {/* Icon with animation */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={`absolute left-0 top-1 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${update.color} bg-white border-4 border-gray-50 transition-transform`}
            >
              {update.icon}
            </motion.div>

            {/* Card with responsive padding */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-4 md:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              {update.id === 7 && (
                <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  ⚡ Latest
                </div>
              )}

              <span className="text-xs md:text-sm text-gray-400">
                {formatDate(update.date)}
              </span>

              <h3 className="text-base md:text-lg font-semibold mt-1">
                {update.title}
              </h3>

              {update.description && (
                <p className="text-gray-600 mt-2 text-xs md:text-sm">
                  {update.description}
                </p>
              )}

              {update.bulletPoints && update.bulletPoints.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs md:text-sm text-gray-600 list-disc list-inside">
                  {update.bulletPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              )}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
