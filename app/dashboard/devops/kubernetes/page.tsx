"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const Kubernetes = () => {
  const [iframeSrc, setIframeSrc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setLoading(true);
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
        setLoading(false);
        setError(null);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
        setLoading(false);
        setError("Failed to load dashboard");
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
        <div className="bg-white rounded-lg shadow-md p-6 relative">
          {loading && <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor"></circle><path className="opacity-75" fill="currentColor" d="M4.93 4.93a10 10 0 0 1 14.14 14.14A10 10 0 1 1 4.93 4.93z"></path></svg>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <iframe
              src={iframeSrc}
              title="Kubernetes Dashboard"
              width="100%"
              height="600px"
              className="border-none"
            ></iframe>
          )}
        </div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default Kubernetes;
