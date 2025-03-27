// components/Unauthorized.tsx
"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const Unauthorized = () => {
  const router = useRouter();

  return (
    <motion.div 
      className="min-h-screen bg-gray-100 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Lock Icon or Unauthorized Image */}
        <motion.div
          className="mb-6 relative w-24 h-24 mx-auto"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        </motion.div>

        <motion.h1 
          className="text-2xl font-bold text-gray-800 mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Access Denied
        </motion.h1>

        <motion.p 
          className="text-gray-600 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          You don&apos;t have permission to access this page. Please contact your administrator at <a href="mailto:param.patil@360world.com" className="text-blue-500 underline">param.patil@360world.com</a> for access.
        </motion.p>


        {/* Home Button */}
        <motion.button
          className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/")}
        >
          Return to Home
        </motion.button>

      </motion.div>
    </motion.div>
  );
};

export default Unauthorized;
