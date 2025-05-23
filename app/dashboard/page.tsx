// app/dashboard/page.tsx
"use client";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Users, 
  Award, 
  HeadphonesIcon, 
  Terminal, 
  BarChart3, 
  ChevronRight,
  MapPin,
  Speech
} from "lucide-react";

const MainDashboard = () => {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Group routes by category
  const getDashboardCategories = () => {
    if (!user || !user.allowedRoutes) return [];

    const allowedRoutes = user.allowedRoutes;
    const categories = [
      {
        name: "Users",
        icon: <Users className="h-5 w-5" />,
        color: "bg-blue-500",
        routes: [
          // { path: '/dashboard/users', name: 'Users Dashboard' },
          { path: '/dashboard/users/all-users', name: 'All Users' },
          { path: '/dashboard/users/find-user', name: 'Find User' },
          { path: '/dashboard/users/active-users-sessions', name: 'Active Users Sessions' },
        ]
      },
      {
        name: "Rewards",
        icon: <Award className="h-5 w-5" />,
        color: "bg-amber-500",
        routes: [
          // { path: '/dashboard/rewards', name: 'Rewards Dashboard' },
          { path: '/dashboard/rewards/available-rewards', name: 'Available Rewards' },
          { path: '/dashboard/rewards/give-rewards', name: 'Give Rewards' },
        ]
      },
      {
        name: "Location",
        icon: <MapPin className="h-5 w-5" />,
        color: "bg-teal-500",
        routes: [
          // { path: '/dashboard/location', name: 'Location Dashboard' },
          { path: '/dashboard/location/active-user-ids', name: 'Active User IDs'},
          { path: '/dashboard/location/user-priority', name: 'User Priority List' },
          { path: '/dashboard/location/blacklist-user', name: 'Blacklist User' },
          { path: '/dashboard/location/deny-list', name: 'Deny List' },
        ]
      },
      {
        name: "Consumer Purchase",
        icon: <Award className="h-5 w-5" />,
        color: "bg-yellow-500",
        routes: [
          // { path: '/dashboard/consumerpurchase', name: 'Consumer Purchase Dashboard' },
          { path: '/dashboard/consumerpurchase/available-offers', name: 'Available Offers' },
          { path: '/dashboard/consumerpurchase/create-offer', name: 'Create Offer' },
        ]
      },
      {
        name: "Customer Support",
        icon: <HeadphonesIcon className="h-5 w-5" />,
        color: "bg-green-500",
        routes: [
          // { path: '/dashboard/customersupport', name: 'Customer Support Dashboard' },
          { path: '/dashboard/customersupport/bug-report', name: 'Bug Report' },
        ]
      },
      {
        name: "DevOps",
        icon: <Terminal className="h-5 w-5" />,
        color: "bg-purple-500",
        routes: [
          // { path: '/dashboard/devops', name: 'DevOps Dashboard' },
          { path: '/dashboard/devops/kubernetes', name: 'Kubernetes Dashboard' },
        ]
      },
      {
        name: "Analytics",
        icon: <BarChart3 className="h-5 w-5" />,
        color: "bg-red-500",
        routes: [
          // { path: '/dashboard/analytics', name: 'Analytics Dashboard' },
          { path: '/dashboard/analytics/grafana', name: 'Grafana Dashboard' },
          { path: '/dashboard/analytics/call-history-table', name: 'Call History Table' },
          { path: '/dashboard/analytics/call-history-analytics', name: 'Call History Analytics' },
          { path: '/dashboard/analytics/call-test-analytics', name: 'Call Test Analytics' },
          { path: '/dashboard/analytics/active-user-analytics', name: 'Active User Analytics' },
        ]
      },
      {
        name: "MP Square",
        icon: <Speech className="h-5 w-5" />,
        color: "bg-pink-500",
        routes: [
          // { path: "/dashboard/mpsquare", name: "MP2 Dashboard" },
          { path: "/dashboard/mpsquare/users-in-jail", name: "Users in Jail" },
          { path: "/dashboard/mpsquare/add-to-jail", name: "Add Users to Jail" },
        ]
      },
      {
        name: "Demo",
        icon: <MapPin className="h-5 w-5" />,
        color: "bg-blue-500",
        routes: [
          // { path: "/dashboard/demo", name: "Demo Dashboard" },
          { path: "/dashboard/demo/globe", name: "Demo Globe" },
        ]
      }
    ];

    // Filter categories to only include those with at least one allowed route
    return categories.map(category => ({
      ...category,
      routes: category.routes.filter(route => allowedRoutes[route.path])
    })).filter(category => category.routes.length > 0);
  };

  const dashboardCategories = getDashboardCategories();

  return (
    <ProtectedRoute allowedRoutes={["/dashboard"]}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Hi {user ? user.displayName || user.email : "Guest"}, welcome back!
          </h1>
          <p className="text-gray-600 mb-6">
            Welcome to your dashboard! This is the main landing page where you
            can view your overview and quick actions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {dashboardCategories.map((category, index) => (
              <motion.div
                key={category.name}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <div className={`${category.color} p-4 text-white`}>
                  <div className="flex items-center gap-2">
                    {category.icon}
                    <h2 className="text-lg font-semibold">{category.name}</h2>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="space-y-2">
                    {category.routes.map((route) => (
                      <Link key={route.path} href={route.path}>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                        >
                          {route.name}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default MainDashboard;
