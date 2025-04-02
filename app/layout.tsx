// app/layout.tsx
import { AuthProvider } from "@/context/AuthContext";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Layout/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { EnvironmentProvider } from "@/context/EnvironmentContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "360 Dashboard",
  description: "360 World Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <EnvironmentProvider>
          <Navbar />
          {children}
          </EnvironmentProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
