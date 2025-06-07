"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import UpdatesTimeline from "@/app/UpdatesTimeline";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="text-center pt-20 pb-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
          Welcome to 360 Dashboards
        </h1>
        <div className="flex justify-center gap-4 mt-8">
          {user ? (
            <Button 
              onClick={() => router.push("/dashboard")}
              className="px-8 py-6 text-lg"
            >
              Go to Main Dashboard
            </Button>
          ) : (
            <Button 
              onClick={() => router.push("/login")}
              className="px-8 py-6 text-lg"
            >
              Get Started - Login
            </Button>
          )}
        </div>
      </div>
      {/* Timeline Section */}
      <UpdatesTimeline />
      {/* Footer */}
      {/* <div className="mt-16 text-center text-gray-500 pb-8">
        <p>Trusted by teams worldwide • v2.1.0</p>
      </div> */}
    </div>
  );
}
