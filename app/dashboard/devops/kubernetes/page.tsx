"use client";
import React from 'react'
import { motion } from 'framer-motion'
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const Kubernetes = () => {
  return (
    <ProtectedRoute allowedRoutes={['/dashboard/devops/kubernetes']}>
    <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
    >
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800">Kubernetes</h2>
            <p className="text-sm text-gray-500">This is the Kubernetes page</p>
        </div>
        <iframe src="https://grafana-s1.360world.com/goto/pq26XvpNR?orgId=1" className='w-full h-[calc(100vh-4rem)] rounded-lg' />
        {/* <iframe src="https://intra.360world.com/admin/k8s/#/workloads?namespace=prod-backend" className='w-full h-[calc(100vh-4rem)] rounded-lg' /> */}
    </motion.div>
    </ProtectedRoute>
  )
}

export default Kubernetes