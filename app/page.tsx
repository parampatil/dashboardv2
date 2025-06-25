"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import UpdatesTimeline from "@/app/UpdatesTimeline";
import { motion } from "framer-motion";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 border-solid"
        />
        <span className="mt-4 text-blue-600 font-medium">Loading dashboard...</span>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex flex-col"
    >
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
        className="flex flex-col items-center justify-center flex-1 text-center py-8 px-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2, type: "spring" }}
          className="w-full"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-green-400 bg-clip-text text-transparent drop-shadow-lg"
          >
            Welcome to 360 Dashboards
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-700 mb-8"
          >
            Your all-in-one platform for actionable insights, real-time updates, and seamless team collaboration.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mt-6"
          >
            {user ? (
              <Button
                onClick={() => router.push("/dashboard")}
                className="px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-300"
                aria-label="Go to Main Dashboard"
              >
                Go to Main Dashboard
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/login")}
                className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-sm hover:opacity-90 text-white shadow-xl transition-all duration-300"
                aria-label="Get Started - Login"
              >
                Get Started – Login
              </Button>
            )}
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Updates / Timeline Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2, type: "spring" }}
        className="container mx-auto mb-16 p-6"
      >
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-2xl font-bold text-blue-700 mb-6 text-center"
        >
          Latest Updates
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <UpdatesTimeline />
        </motion.div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-auto py-6 text-center text-gray-500 bg-transparent"
      >
        <p>
          360World &bull; <span className="font-semibold text-blue-600">v2.1.0</span>
        </p>
      </motion.footer>
    </motion.div>
  );
}
