// app/page.tsx
"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user, loading } = useAuth();

  const router = useRouter();

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-6">
        Welcome to 360 Dashboards
      </h1>
      {user ? (
        <div className="text-center">
          <p className="mb-4">You are logged in. You can proceed to the dashboard.</p>
          <Button onClick={() => router.push("/dashboard")}>
            Go to Main Dashboard
          </Button>
        </div>
      ) : (
        <Button onClick={() => router.push("/login")}>Login</Button>
      )}
    </div>
  );
}
