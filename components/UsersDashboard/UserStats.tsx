import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useApi } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";
import { useEnvironment } from "@/context/EnvironmentContext";
import CountUp from "@/components/ui/CountUp";
import ThreeDotsLoader from "@/components/ui/ThreeDotsLoader";

interface UserStats {
  totalCount: string;
  world360Users: string;
  nonWorld360Users: string;
}

const statCards = [
  { label: "Total Users", color: "text-cyan-600", key: "totalCount" },
  { label: "360 Users", color: "text-green-600", key: "world360Users" },
  { label: "Non-360 Users", color: "text-purple-600", key: "nonWorld360Users" },
];

const UserStats = () => {
  const [stats, setStats] = useState<UserStats>({
    totalCount: "0",
    world360Users: "0",
    nonWorld360Users: "0",
  });
  const [loading, setLoading] = useState(true);
  const { currentEnvironment } = useEnvironment();
  const api = useApi();

  const fetchUserStats = async () => {
    setLoading(true);
    try {
      const response = await api.fetch("/api/grpc/users/user-stats");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error.details || data.error.errorMessage);
      setStats(data.stats);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch user stats",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserStats();
    // eslint-disable-next-line
  }, [currentEnvironment]);

  return (
    <div
      className="
        flex flex-col w-full gap-2
        md:flex-row md:gap-0
        bg-white/70 rounded-xl p-2
        md:p-0
      "
    >
      {statCards.map((stat, idx) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + idx * 0.07 }}
          className={`
            flex flex-row items-center justify-between
            w-full px-3 py-2
            ${idx < statCards.length - 1 ? "md:border-r md:border-gray-300" : ""}
          `}
        >
          <span className="text-md text-gray-500 font-medium">{stat.label}</span>
          <span className={`ml-4 text-base font-semibold ${stat.color} min-w-[3.5rem] text-right`}>
            {loading ? <ThreeDotsLoader /> : (
              <CountUp
                to={parseInt(stats[stat.key as keyof UserStats])}
                from={0}
                duration={0.3}
                className={stat.color}
              />
            )}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export default UserStats;
