// pages/404.tsx
"use client"
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Custom404() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      {/* Animated 404 Text */}
      <motion.h1
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-9xl font-extrabold drop-shadow-lg"
      >
        404
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        className="mt-4 text-center text-2xl"
      >
        Oops! The page you&apos;re looking for doesn&apos;t exist.
      </motion.p>

      {/* Animation for a bouncing emoji */}
      <motion.div
        initial={{ y: -10 }}
        animate={{ y: [0, -20, 0] }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 1,
          ease: "easeInOut",
        }}
        className="mt-6 text-6xl"
      >
        🚀
      </motion.div>

      {/* Back to Home Button */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
        className="mt-8"
      >
        <Link href="/">
          <button className="rounded-lg bg-white px-6 py-3 font-bold text-blue-500 shadow-lg transition duration-300 hover:bg-gray-100">
            Take Me Home
          </button>
        </Link>
      </motion.div>
    </div>
  );
};
