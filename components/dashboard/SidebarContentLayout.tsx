// components/dashboard/SidebarContentLayout.tsx
"use client";

import { DashboardFileTree } from "./DashboardFileTree";
import { cn } from "@/lib/utils"; // Assuming you have this utility

interface SidebarContentLayoutProps {
  isMobileSheet?: boolean;
  onLinkClick?: () => void;
  isDesktopSidebarCollapsed?: boolean; 
  allowedRoutes: { [key: string]: string }; 
}

export function SidebarContentLayout({ 
  isMobileSheet = false, 
  onLinkClick,
  isDesktopSidebarCollapsed = false,
  allowedRoutes
}: SidebarContentLayoutProps) {

  return (
    <div className={cn("flex flex-col h-full", isMobileSheet ? "p-0" : "p-2 pt-0")}>
      {/* File Tree Navigation */}
      <div className={cn("flex-grow overflow-y-auto overflow-x-hidden hide-scrollbar", isMobileSheet ? "p-4 pt-0" : "")}> {/* Adjusted padding for sheet */}
        <DashboardFileTree
          allowedRoutes={allowedRoutes}
          isCollapsed={isDesktopSidebarCollapsed && !isMobileSheet} 
          onLinkClick={onLinkClick}
        />
      </div>
    </div>
  );
}
