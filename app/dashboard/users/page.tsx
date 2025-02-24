"use client";
import React from 'react'
import { motion } from 'framer-motion'

const Users = () => {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800">Users</h2>
        <p className="text-sm text-gray-500">This is the users page</p>
      </div>
    </motion.div>
  )
}

export default Users