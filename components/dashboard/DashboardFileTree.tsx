// app/components/dashboard/DashboardFileTree.tsx
"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ChevronRight, ChevronDown, Folder, FolderOpen, FileText, Shield, Settings, 
    LayoutGrid, BarChart3, Users, MapPin, ShoppingCart, Award, Terminal, ToggleLeft, Headphones
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Icon Mapping
const routeIconMap: Record<string, React.ReactElement<{className?: string}>> = {
    "/dashboard/analytics": <BarChart3 />,
    "/dashboard/users": <Users />,
    "/dashboard/location": <MapPin />,
    "/dashboard/consumerpurchase": <ShoppingCart />,
    "/dashboard/rewards": <Award />,
    "/dashboard/devops": <Terminal />,
    "/dashboard/remoteconfig": <ToggleLeft />,
    "/dashboard/mpsquare": <Shield />,
    "/dashboard/customersupport": <Headphones />,
    "/dashboard/demo": <LayoutGrid />,
    // Admin section items
    "/admin/roles": <Shield />,
    "/admin/users": <Users />,
};

const getDefaultSectionIcon = (props?: {className?: string}) => <LayoutGrid className={cn("h-4 w-4", props?.className)} />;
const getDefaultPageIcon = (props?: {className?: string}) => <FileText className={cn("h-4 w-4", props?.className)} />;
const getAdminPageIcon = (props?: {className?: string}) => <Settings className={cn("h-4 w-4", props?.className)} />;


interface TreeNodeData {
  name: string;
  path: string;
  children?: TreeNodeData[];
  icon?: React.ReactElement<{ className?: string }>; 
}

interface DashboardFileTreeProps {
  allowedRoutes: { [key: string]: string };
  isCollapsed: boolean; 
  onLinkClick?: () => void; 
}

export function DashboardFileTree({ allowedRoutes, isCollapsed, onLinkClick }: DashboardFileTreeProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const { dashboardItems, adminItems } = React.useMemo(() => {
    const dashboardSections: Record<string, TreeNodeData> = {};
    const adminPages: TreeNodeData[] = [];

    Object.entries(allowedRoutes).forEach(([path, name]) => {
      let baseIcon = routeIconMap[path];
      const isSection = path.startsWith("/dashboard/") && path.split('/').length === 3;
      const isAdminPage = path.startsWith("/admin/");

      if (!baseIcon) {
        if (isAdminPage) baseIcon = getAdminPageIcon();
        else if (isSection) baseIcon = getDefaultSectionIcon();
        else baseIcon = getDefaultPageIcon();
      }
      const clonedIcon = React.isValidElement(baseIcon) ? React.cloneElement(baseIcon as React.ReactElement<{className?: string}>) : getDefaultPageIcon();


      if (path.startsWith("/dashboard/")) {
        const parts = path.split("/");
        const sectionName = parts[2];
        const pageName = parts[3];

        if (!dashboardSections[sectionName]) {
          dashboardSections[sectionName] = {
            name: sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace(/-/g, ' '),
            path: `/dashboard/${sectionName}`, 
            children: [],
            icon: routeIconMap[`/dashboard/${sectionName}`] || getDefaultSectionIcon()
          };
        }
        if (pageName && path !== dashboardSections[sectionName].path) {
          dashboardSections[sectionName].children = dashboardSections[sectionName].children || [];
          dashboardSections[sectionName].children?.push({ 
            name, 
            path, 
            icon: clonedIcon
          });
        }
      } else if (isAdminPage) {
        adminPages.push({
          name,
          path,
          icon: clonedIcon
        });
      }
    });

    const sortedDashboardKeys = Object.keys(dashboardSections).sort((a,b) => 
        dashboardSections[a].name.localeCompare(dashboardSections[b].name)
    );
    const dashboardTree: TreeNodeData[] = sortedDashboardKeys.map(key => {
      const section = dashboardSections[key];
      if (section.children) {
        section.children.sort((a, b) => a.name.localeCompare(b.name));
      }
      return section;
    });

    adminPages.sort((a,b) => a.name.localeCompare(b.name));

    return { dashboardItems: dashboardTree, adminItems: adminPages };
  }, [allowedRoutes]);


  if (!dashboardItems.length && !adminItems.length) { 
    return isCollapsed ? null : <div className="p-4 text-xs text-slate-500">No accessible items.</div>;
  }

  const activePathSegment = pathname.split('/')[pathname.startsWith('/admin') ? 1 : 2];

  return (
    <motion.div 
      className={cn("w-full", isCollapsed ? "py-1" : "p-1")}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {dashboardItems.map((node, index) => (
        <TreeNode 
          key={`dash-${node.path}-${index}`} 
          node={node} 
          level={0} 
          activePathSegment={activePathSegment}
          currentPath={pathname}
          onNodeClick={onLinkClick}
          isCollapsed={isCollapsed}
        />
      ))}
      {adminItems.length > 0 && (
        <div className={cn("mt-2 pt-2 border-t border-slate-200", isCollapsed ? "px-0" : "px-1")}>
          <Link 
            href="/admin" // Default admin page
            onClick={(e) => {
                e.preventDefault(); // Prevent default if it's just a header when expanded
                // if (isCollapsed && onLinkClick) onLinkClick(); // Close sheet if collapsed and clicked
                router.push("/admin"); // Navigate if collapsed
            }}
            className={cn(
                "flex items-center group mb-1 rounded-md transition-colors", 
                isCollapsed ? "justify-center h-10 w-full p-0 hover:bg-slate-100" : "px-2 py-1",
                pathname.startsWith("/admin") && !isCollapsed ? "text-primary" : "" // No bg for header
            )}
            title="Admin Section"
          >
            <Shield className={cn("shrink-0", 
                isCollapsed ? "h-5 w-5" : "h-4 w-4 mr-2",
                pathname.startsWith("/admin") && isCollapsed ? "text-primary" : "text-slate-500 group-hover:text-primary"
            )} />
            {!isCollapsed && (
              <h3 className={cn(
                  "text-xs font-semibold uppercase tracking-wider group-hover:text-primary/80",
                  pathname.startsWith("/admin") ? "text-primary" : "text-slate-400"
                )}
              >
                Admin
              </h3>
            )}
          </Link>

          {!isCollapsed && adminItems.map((node, index) => (
             <TreeNode
                key={`admin-${node.path}-${index}`}
                node={node}
                level={1} 
                activePathSegment={activePathSegment}
                currentPath={pathname}
                onNodeClick={onLinkClick}
                isCollapsed={isCollapsed} 
                isTopLevelAdminItem={true} 
             />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function TreeNode({ 
  node, 
  level, 
  activePathSegment,
  currentPath,
  onNodeClick,
  isCollapsed,
  isTopLevelAdminItem = false 
}: { 
  node: TreeNodeData; 
  level: number;
  activePathSegment: string;
  currentPath: string;
  onNodeClick?: () => void;
  isCollapsed: boolean;
  isTopLevelAdminItem?: boolean; 
}) {
  const router = useRouter();
  const isExpandable = node.children && node.children.length > 0;

  const initialOpenState = () => {
    if (isCollapsed && level === 0 && !isTopLevelAdminItem) return false; 
    if (level === 0 && isExpandable) return node.path.split('/')[isTopLevelAdminItem ? 1 : 2] === activePathSegment;
    if (isExpandable) return currentPath.startsWith(node.path);
    return false;
  };
  const [isOpen, setIsOpen] = useState(initialOpenState());
  
  useEffect(() => {
    setIsOpen(initialOpenState());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePathSegment, currentPath, node.path, level, isCollapsed]);

  const toggleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isExpandable && (!isCollapsed || level !== 0 || (isTopLevelAdminItem && isExpandable))) { 
        setIsOpen(!isOpen);
    }
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isExpandable && !isCollapsed && (level === 0 || isTopLevelAdminItem)) { 
        toggleOpen(e);
        if (level === 0 && node.path !== currentPath && !isTopLevelAdminItem && !node.children?.some(child => currentPath.startsWith(child.path))) {
             router.push(node.path);
        }
    } else if (isExpandable && level > 0) { 
        toggleOpen(e);
    }
     else { 
        router.push(node.path);
    }
    if (onNodeClick) {
      onNodeClick();
    }
  };

  const isDirectlyActive = currentPath === node.path;
  const isChildActive = isExpandable && node.children?.some(child => currentPath.startsWith(child.path));
  
  let displayIcon: React.ReactElement;
  const iconBaseClass = "h-4 w-4 shrink-0";
  const iconMarginClass = isCollapsed && level === 0 ? "" : "mr-1.5"; // Use 1.5 for tighter spacing

  // Determine active color for icon
  const activeIconColorClass = "text-primary";
  const inactiveIconColorClass = "text-slate-600 group-hover:text-primary";
  const inactiveFileIconColorClass = "text-slate-500 group-hover:text-primary";

  if (isExpandable) { 
    const baseIcon = node.icon || (isOpen ? <FolderOpen /> : <Folder />);
    displayIcon = React.cloneElement(baseIcon as React.ReactElement<{className?: string}>, {
        className: cn(iconBaseClass, iconMarginClass, (isOpen || isChildActive) && !isCollapsed ? activeIconColorClass : inactiveIconColorClass)
    });
  } else { 
    const baseIcon = node.icon || <FileText />;
    displayIcon = React.cloneElement(baseIcon as React.ReactElement<{className?: string}>, {
        className: cn(iconBaseClass, iconMarginClass, isDirectlyActive ? activeIconColorClass : inactiveFileIconColorClass)
    });
  }
  
  if (isCollapsed && level === 0) {
    const collapsedIconBaseClass = "h-5 w-5"; // No group hover for collapsed state icon color directly
    const collapsedIconColor = isDirectlyActive || (isExpandable && isChildActive) ? "text-primary" : "text-slate-500";

    if (isTopLevelAdminItem) { 
        displayIcon = node.icon ? React.cloneElement(node.icon, {className: cn(collapsedIconBaseClass, collapsedIconColor)}) : <Settings className={cn(collapsedIconBaseClass, collapsedIconColor)} />;
    } else { 
        displayIcon = node.icon ? React.cloneElement(node.icon, {className: cn(collapsedIconBaseClass, collapsedIconColor)}) : <LayoutGrid className={cn(collapsedIconBaseClass, collapsedIconColor)} />;
    }
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: level * 0.05 }}
      className="my-0.5 ms-1.5" 
    >
      <Link
        href={node.path}
        onClick={handleNodeClick}
        className={cn(
          "flex items-center py-2 px-2 rounded-md group transition-all duration-150 ease-in-out",
          level === 0 && !isTopLevelAdminItem ? "font-medium text-sm" : "text-sm", 
          isDirectlyActive ? "bg-primary/10 text-primary font-semibold" : 
          (isChildActive && !isCollapsed && level === 0 ? "text-primary" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"),
          isCollapsed && level === 0 ? "justify-center h-10 w-10 p-0" : "" 
        )}
        title={node.name}
      >
        {isExpandable && (!isCollapsed || level > 0) && ( 
          <button 
            onClick={toggleOpen} 
            className={cn(
                "p-0.5 rounded hover:bg-slate-200 focus:outline-none shrink-0",
                isCollapsed && level === 0 ? "hidden" : "mr-1.5" 
            )}
            aria-expanded={isOpen}
            aria-controls={`subtree-${node.path}`}
          >
            {isOpen ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
          </button>
        )}
        
        {displayIcon}
        
        {(!isCollapsed || level !== 0) && (
             <span className={cn(
                 "truncate", 
                 (isCollapsed && level === 0) ? "hidden" : "block",
                 isDirectlyActive ? "text-primary font-semibold" : (isChildActive && level === 0 ? "text-primary" : "")
                )}
            >
                {node.name}
            </span>
        )}
      </Link>
      <AnimatePresence initial={false}>
        {isOpen && isExpandable && (!isCollapsed || level !==0 ) && 
          <motion.div
            id={`subtree-${node.path}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
            style={{ paddingLeft: `${(level === 0 ? 1 : level + 1) * 12 + (isTopLevelAdminItem || !isExpandable ? 8 : 0) }px` }} // Adjusted indentation
          >
            {node.children?.map((child) => (
              <TreeNode 
                key={child.path} 
                node={child} 
                level={level + 1} 
                activePathSegment={activePathSegment}
                currentPath={currentPath}
                onNodeClick={onNodeClick}
                isCollapsed={isCollapsed} 
              />
            ))}
          </motion.div>
        }
      </AnimatePresence>
    </motion.div>
  );
}
