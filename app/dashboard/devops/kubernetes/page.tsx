"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const Kubernetes = () => {
  const [iframeSrc, setIframeSrc] = useState('');
  
  useEffect(() => {
    async function fetchDashboard() {
      try {
        // Replace with your actual token
        const token = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImR1OXNueG9SRXFsR3p0bGl3RzJjWm55Y0xrLTJpSWREcGNDaTh1VDN4VXcifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlcm5ldGVzLWRhc2hib2FyZCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiIzNWZkNDAxZC04ZjRjLTQ4ZWQtYmQwMy02ZGFhOWU0MzM2MjgiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZXJuZXRlcy1kYXNoYm9hcmQ6YWRtaW4tdXNlciJ9.YAJX5MnTokTG0tRJmECEJAotr9g2Uwhy-gcqpF3RRDOcF2y4i3hE_hIRaFJ4oG4c_IuxUoZDXfsa6dJ0EExRZXRw8HCsFlYbgD6cTHXsx7PJEyalLIcVEgwiGiBKpcn0UUYRXKIF4qEuIji9T6qU6xZelVymbySZj79mEkZpBPsoO4FWMJkAsqA4cf4vxuIni0hqopGqT7ZFaNV34LpHXlokavxZezczbk-JKuQ12QdJ1n8SJMCbpSFCjh6lGMC60tLHXudMb49N4tV7nCnNDtsL-7J8ddhUwZNASnqrBEPso_cJRQYLAhc4g74pTVhdn5WzS30a__7puzliN2wLtQ";
        const dashboardUrl = "https://intra.360world.com/admin/k8s/#/workloads?namespace=prod-backend";
        
        const response = await fetch(dashboardUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const blob = await response.blob();
        const urlObject = URL.createObjectURL(blob);
        setIframeSrc(urlObject);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      }
    }
    
    fetchDashboard();
    
    // Cleanup function to revoke URL object
    return () => {
      if (iframeSrc) {
        URL.revokeObjectURL(iframeSrc);
      }
    };
  }, []);
  
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
        {iframeSrc ? (
          <iframe 
            src={iframeSrc} 
            className='w-full h-[calc(100vh-4rem)] rounded-lg'
          />
        ) : (
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <p>Loading Kubernetes Dashboard...</p>
          </div>
        )}
      </motion.div>
    </ProtectedRoute>
  );
};

export default Kubernetes;
