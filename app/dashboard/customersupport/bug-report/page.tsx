"use client";
import React from 'react'
import { motion } from 'framer-motion'
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const BugReport = () => {
  return (
    <ProtectedRoute allowedRoutes={['/dashboard/customersupport/bug-report']}>
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800">Bug Report</h2>
        <p className="text-sm text-gray-500">This is the bug report page</p>
      </div>
    </motion.div>
    </ProtectedRoute>
  )
}

export default BugReport