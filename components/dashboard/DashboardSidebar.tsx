// components/dashboard/DashboardSidebar.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarContentLayout } from "./SidebarContentLayout";
import { Button } from "@/components/ui/button";
import { 
    Pin, PinOff, Settings, LogOut, UserCircle, ChevronDown, 
    LayoutDashboard, LogInIcon, Menu as MenuIcon
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { EnvironmentSelector } from "@/components/Layout/EnvironmentSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    Sheet, SheetContent, SheetTrigger, SheetClose,
    SheetHeader, SheetTitle
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const cn = (...classes: (string | undefined | boolean)[]) => classes.filter(Boolean).join(' ');

const EXPANDED_WIDTH = "18rem"; 
const COLLAPSED_WIDTH = "4.5rem"; 

interface DashboardSidebarProps {
    onDesktopWidthChange: (width: string) => void; 
}

export function DashboardSidebar({ onDesktopWidthChange }: DashboardSidebarProps) {
  const [isPinned, setIsPinned] = useState(false); 
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isDesktopDropdownActive, setIsDesktopDropdownActive] = useState(false); 

  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth(); 
  const pathname = usePathname(); 

  const isDesktopEffectivelyOpen = !isMobileView && (isPinned || isHovered || isDesktopDropdownActive);
  const currentDesktopSidebarWidth = isDesktopEffectivelyOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; 
      setIsMobileView(mobile);
      if (mobile) {
        setIsPinned(false); 
        setIsHovered(false);
        setIsDesktopDropdownActive(false);
        onDesktopWidthChange("0rem"); 
      } else {
        onDesktopWidthChange(isPinned ? EXPANDED_WIDTH : COLLAPSED_WIDTH);
      }
    };
    checkMobile(); 
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPinned]); 

  useEffect(() => { 
    if (!isMobileView) {
        onDesktopWidthChange(currentDesktopSidebarWidth);
    } else {
        onDesktopWidthChange("0rem"); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktopEffectivelyOpen, isMobileView, currentDesktopSidebarWidth]);

  useEffect(() => {
    if (isMobileSheetOpen && pathname) { // Check pathname to ensure it's defined
        setIsMobileSheetOpen(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Removed isMobileSheetOpen from deps to avoid loop


  const handleMouseEnter = () => {
    if (!isPinned && !isMobileView) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!isPinned && !isMobileView && !isDesktopDropdownActive) {
        setIsHovered(false);
    }
  };
  
  const togglePin = () => { 
    const newPinState = !isPinned;
    setIsPinned(newPinState);
    if (newPinState) {
        setIsHovered(true); 
        setIsDesktopDropdownActive(false); 
    } else {
        if (sidebarRef.current && !sidebarRef.current.matches(':hover') && !isDesktopDropdownActive) {
            setIsHovered(false);
        }
    }
  };

  const sidebarVariants = {
    collapsed: { width: COLLAPSED_WIDTH, transition: { type: "spring", stiffness: 350, damping: 30 } }, 
    expanded: { width: EXPANDED_WIDTH, transition: { type: "spring", stiffness: 350, damping: 30 } }, 
  };
  
  const contentVariants = { 
    collapsed: { opacity: 0, x: -5, display: 'none', transition: { duration: 0.1 } },
    expanded: { opacity: 1, x: 0, display: 'flex', transition: { duration: 0.2, delay: 0.1 } },
  };
   const titleContentVariants = { 
    collapsed: { opacity: 0, x: -5, display: 'none', transition: { duration: 0.1 } },
    expanded: { opacity: 1, x: 0, display: 'block', transition: { duration: 0.2, delay: 0.05 } },
  };
  
  const UserProfileMenu = ({isExpandedContext, inSheetContext} : {isExpandedContext: boolean, inSheetContext: boolean}) => (
    <DropdownMenu 
        modal={inSheetContext ? true : false} // Modal for sheet, non-modal for desktop hover
        // onOpenChange={inSheetContext ? undefined : setIsDesktopDropdownActive}
    > 
        <DropdownMenuTrigger asChild>
            <Button 
                variant="ghost" 
                className={cn(
                    "flex items-center w-full p-2 hover:bg-slate-100 rounded-lg transition-colors h-auto", 
                    isExpandedContext ? "justify-start gap-3" : "justify-center aspect-[1/1]" 
                )}
                aria-label="User account options"
            >
                {user?.imageUrl ? (
                <Image
                    src={user.imageUrl}
                    alt={user.name || "User"}
                    width={isExpandedContext ? 36 : 30}
                    height={isExpandedContext ? 36 : 30}
                    className="rounded-full border-2 border-slate-200 shrink-0 transition-all duration-300 ease-in-out"
                />
                ) : (
                <div className={cn(
                    "rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium shrink-0",
                    isExpandedContext ? "h-9 w-9 text-sm" : "h-[30px] w-[30px] text-xs"
                )}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || <UserCircle size={isExpandedContext ? 20 : 18}/>}
                </div>
                )}
                <AnimatePresence>
                {isExpandedContext && (
                    <motion.div 
                        key="user-profile-text-content" 
                        variants={contentVariants} 
                        initial="collapsed" 
                        animate="expanded" 
                        exit="collapsed" 
                        className="overflow-hidden flex-grow text-left items-center"
                    >
                        <div className="flex-grow">
                            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || user?.email}</p>
                            <p className="text-xs text-slate-500">Account</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-slate-500 shrink-0 ml-1" />
                    </motion.div>
                )}
                </AnimatePresence>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
            side={inSheetContext ? "bottom" : "right"} 
            align="start" 
            className={cn("w-56 z-[100]", inSheetContext && "w-[calc(280px-2.5rem)]")} 
            sideOffset={inSheetContext ? 5 : (isExpandedContext ? 5 : 20)}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onFocusOutside={inSheetContext ? undefined : (event) => event.preventDefault()}
            onPointerDownOutside={inSheetContext ? undefined : (event) => {
                // For desktop, if clicking outside dropdown but still inside sidebar, don't close dropdown.
                // If sidebar itself is not pinned, this might still cause sidebar to close due to mouseleave.
                if (sidebarRef.current && sidebarRef.current.contains(event.target as Node)) {
                    return;
                }
                event.preventDefault();
            }}
        >
            <DropdownMenuLabel>{user?.name || user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { router.push('/profile'); if(inSheetContext) setIsMobileSheetOpen(false); }}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
            </DropdownMenuItem>
            {(user?.allowedRoutes && Object.keys(user.allowedRoutes).some(route => route.startsWith("/admin/"))) && (
                <DropdownMenuItem onClick={() => { router.push('/admin'); if(inSheetContext) setIsMobileSheetOpen(false); }}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Admin</span>
                </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { signOut(); if(inSheetContext) setIsMobileSheetOpen(false); }} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );

  // Mobile View: Trigger for Sheet and the Sheet itself
  if (isMobileView) {
    return (
        <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetTrigger asChild>
                 <Button variant="outline" size="icon" className="fixed top-2 right-4 z-50 lg:hidden bg-white shadow-md w-10 h-10 rounded-full">
                     <MenuIcon className="h-5 w-5 text-slate-700"/>
                     <span className="sr-only">Open Menu</span>
                 </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 bg-white border-r border-slate-200 flex flex-col z-[70]">
                <SheetHeader className="p-3 pt-4 border-b border-slate-200"> 
                    <SheetTitle>
                        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 mb-4 h-9" onClick={() => setIsMobileSheetOpen(false)}>
                            <div 
                                className="bg-primary p-1.5 rounded-md text-white flex items-center justify-center shrink-0"
                                style={{ width: '30px', height: '30px' }} 
                            >
                                <LayoutDashboard className="h-4 w-4" />
                            </div>
                            <h1 className="text-lg font-semibold text-slate-800 whitespace-nowrap">360 Dashboard</h1>
                        </Link>
                    </SheetTitle>
                    {/* Optional: <SheetDescription> can be added here if needed */}
                    {user && !authLoading ? (
                        <>
                        <UserProfileMenu isExpandedContext={true} inSheetContext={true} />
                        <EnvironmentSelector />
                        </>
                    ) : !authLoading ? (
                         <Button variant="outline" className="w-full mt-2 h-10 text-sm" onClick={() => {router.push('/login'); setIsMobileSheetOpen(false);}}>
                            <LogInIcon className="mr-2 h-4 w-4" /> Sign In
                        </Button>
                    ) : null}
                </SheetHeader>
                
                <div className="flex-grow overflow-y-auto hide-scrollbar">
                    {user && !authLoading ? (
                        <SidebarContentLayout 
                            isMobileSheet={true} 
                            isDesktopSidebarCollapsed={false} 
                            allowedRoutes={user?.allowedRoutes || {}}
                            onLinkClick={() => setIsMobileSheetOpen(false)} 
                        />
                    ) : (
                        <div className="p-4 text-sm text-slate-500 flex-grow flex items-center justify-center">
                            Please sign in to see navigation options.
                        </div>
                    )}
                </div>
                 <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-background data-[state=open]:bg-accent data-[state=open]:text-muted-foreground p-1">
                    <span className="sr-only">Close</span>
                </SheetClose>
            </SheetContent>
        </Sheet>
    );
  }

  // Desktop Sidebar
  return (
    <motion.aside
      ref={sidebarRef}
      className="fixed top-0 left-0 h-screen z-30 bg-white shadow-xl border-r border-slate-200 flex flex-col justify-between print:hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={isDesktopEffectivelyOpen ? "expanded" : "collapsed"}
      initial={isPinned ? "expanded" : "collapsed"} 
      variants={sidebarVariants}
    >
      <div className="flex-grow flex flex-col overflow-hidden">
          <div className="p-3 pt-4 flex-shrink-0 border-b border-slate-200">
            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link 
                            href={user ? "/dashboard" : "/"} 
                            className={cn(
                                "flex items-center gap-2 mb-4 h-9", 
                                !isDesktopEffectivelyOpen && "justify-center" 
                            )}
                        >
                            <div 
                                className="bg-primary p-1.5 rounded-md text-white flex items-center justify-center shrink-0"
                                style={{ width: '30px', height: '30px' }} 
                            >
                                <LayoutDashboard className="h-4 w-4" />
                            </div>
                            <AnimatePresence>
                            {isDesktopEffectivelyOpen && (
                                <motion.h1 
                                    key="dashboard-title-sidebar-desktop"
                                    variants={titleContentVariants} 
                                    initial="collapsed" 
                                    animate="expanded" 
                                    exit="collapsed" 
                                    className="text-lg font-semibold text-slate-800 whitespace-nowrap"
                                >
                                    360 Dashboard
                                </motion.h1>
                            )}
                            </AnimatePresence>
                        </Link>
                    </TooltipTrigger>
                    {!isDesktopEffectivelyOpen && (
                         <TooltipContent side="right" align="center" sideOffset={10}>
                            <p>360 Dashboard</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
              {user && !authLoading ? (
                <UserProfileMenu isExpandedContext={isDesktopEffectivelyOpen} inSheetContext={false} />
              ) : !authLoading ? ( 
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link 
                                href="/login" 
                                className={cn(
                                    "w-full flex items-center p-2 rounded-lg hover:bg-slate-100 h-auto",
                                    !isDesktopEffectivelyOpen && "justify-center aspect-square"
                                )}
                            >
                                <LogInIcon className={cn("h-5 w-5 text-slate-600 shrink-0", isDesktopEffectivelyOpen && "mr-2")} />
                                {isDesktopEffectivelyOpen && <motion.span key="signin-text" variants={contentVariants} initial="collapsed" animate="expanded" exit="collapsed" className="text-sm text-slate-700 items-center">Sign In</motion.span>}
                            </Link>
                        </TooltipTrigger>
                         {!isDesktopEffectivelyOpen && (
                             <TooltipContent side="right" align="center" sideOffset={10}><p>Sign In</p></TooltipContent>
                         )}
                    </Tooltip>
                </TooltipProvider>
              ) : null }
          </div>
          {user && !authLoading && (
            <div className="flex-grow overflow-y-auto hide-scrollbar mt-2">
                <SidebarContentLayout 
                isMobileSheet={false} 
                isDesktopSidebarCollapsed={!isDesktopEffectivelyOpen}
                allowedRoutes={user?.allowedRoutes || {}}
                onLinkClick={() => {
                    if (!isPinned) setIsHovered(false); 
                }} 
                />
            </div>
          )}
      </div>
      
      {user && !authLoading && (
        <div className="p-3 border-t border-slate-200 flex-shrink-0 space-y-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                  "w-full text-slate-600 hover:bg-slate-100 h-9 flex items-center",
                  isDesktopEffectivelyOpen ? "justify-start" : "justify-center" 
              )} 
              onClick={togglePin} 
              title={isPinned ? "Unpin Sidebar" : "Pin Sidebar"}
            >
                {isPinned ? <PinOff className="h-4 w-4 shrink-0" /> : <Pin className="h-4 w-4 shrink-0" />}
                <AnimatePresence>
                    {isDesktopEffectivelyOpen && (
                        <motion.span 
                            key="pin-text-sidebar-desktop"
                            variants={contentVariants} 
                            initial="collapsed" 
                            animate="expanded" 
                            exit="collapsed" 
                            className="ml-2 text-xs items-center"
                        >
                            {isPinned ? "Unpin Sidebar" : "Pin Sidebar"}
                        </motion.span>
                    )}
                </AnimatePresence>
            </Button>
            <EnvironmentSelector isExpanded={isDesktopEffectivelyOpen} />
        </div>
      )}
       {!user && !authLoading && !isDesktopEffectivelyOpen && ( 
            <div className="p-3 border-t border-slate-200 flex-shrink-0 flex justify-center">
                 <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link href="/login">
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <LogInIcon className="h-5 w-5 text-slate-600" />
                                </Button>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center" sideOffset={10}><p>Sign In</p></TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
            </div>
        )}
    </motion.aside>
  );
}
