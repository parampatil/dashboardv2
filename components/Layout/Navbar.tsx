// @/components/Layout/Navbar.tsx
"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { UserNav } from "@/components/Layout/UserNav";
import { EnvironmentSelector } from "@/components/Layout/EnvironmentSelector";

const Navbar = () => {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [hoveredPath, setHoveredPath] = useState(pathname);

  if (loading) {
    return (
      <motion.div
        className="h-16 bg-white border-b border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 0.5 }}
      />
    );
  }

  const getNavItems = () => {
    if (!user) return [{ path: "/login", name: "Login" }];

    const items = [];
    const allowedRoutes = user.allowedRoutes || {};

    if (
      Object.keys(allowedRoutes).some((route) => route.startsWith("/dashboard"))
    ) {
      items.push({ path: "/dashboard", name: "Dashboard" });
    }

    if (allowedRoutes["/admin"]) {
      items.push({ path: "/admin/roles", name: "Roles" });
      items.push({ path: "/admin/users", name: "Users" });
    }

    if (allowedRoutes["/profile"]) {
      items.push({ path: "/profile", name: "Profile" });
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <motion.nav
      className="sticky top-0 z-50 h-16 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto h-full flex items-center justify-between">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/dashboard" className="font-semibold text-lg text-gray-900">
            360 World Dashboard
          </Link>
        </motion.div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-gray-100/80 p-1">
            {navItems.map((item, index) => (
              <Link key={`nav-${index}`} href={item.path}>
                <motion.div
                  onMouseOver={() => setHoveredPath(item.path)}
                  onMouseLeave={() => setHoveredPath(pathname)}
                  className="relative px-3 py-2 rounded-md"
                >
                  <span
                    className={`relative z-10 ${
                      pathname === item.path ||
                      pathname?.startsWith(item.path + "/")
                        ? "text-blue-600 font-medium"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {item.name}
                  </span>

                  {(item.path === hoveredPath ||
                    pathname?.startsWith(item.path + "/")) && (
                    <motion.div
                      className="absolute inset-0 bg-gray-200/80 rounded-md -z-0"
                      layoutId="navbar-hover"
                      transition={{
                        type: "spring",
                        bounce: 0.25,
                        stiffness: 130,
                        damping: 12,
                        duration: 0.3,
                      }}
                    />
                  )}
                </motion.div>
              </Link>
            ))}
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <EnvironmentSelector />
              <UserNav />
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
