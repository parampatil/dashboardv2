"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import UpdatesTimeline from "@/app/UpdatesTimeline";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        <span className="mt-4 text-blue-600 font-medium">Loading dashboard...</span>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 text-center py-8 px-4">
        <div className="max-w-7xl w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-green-400 bg-clip-text text-transparent drop-shadow-lg">
            Welcome to 360 Dashboards
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8">
            Your all-in-one platform for actionable insights, real-time updates, and seamless team collaboration.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            {user ? (
              <Button
                onClick={() => router.push("/dashboard")}
                className="px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all"
                aria-label="Go to Main Dashboard"
              >
                Go to Main Dashboard
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/login")}
                className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-blue-600 hover:to-cyan-500 text-white shadow-lg transition-all"
                aria-label="Get Started - Login"
              >
                Get Started – Login
              </Button>
            )}
          </div>
        </div>
        
      </section>

      {/* Updates / Timeline Section */}
      <section className="max-w-3xl w-full mx-auto mb-16">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Latest Updates</h2>
        <div className="bg-white rounded-xl shadow-md p-6">
          <UpdatesTimeline />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-gray-500 bg-transparent">
        <p>
          360World &bull; <span className="font-semibold text-blue-600">v2.1.0</span>
        </p>
      </footer>
    </div>
  );
}
