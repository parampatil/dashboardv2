// app/components/dashboard/DashboardFileTree.tsx
"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Folder, FolderOpen, File, FileText } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface TreeNode {
  name: string;
  path: string;
  children?: TreeNode[];
}

interface DashboardFileTreeProps {
  allowedRoutes: { [key: string]: string };
  isCollapsed: boolean;
}

export function DashboardFileTree({ allowedRoutes, isCollapsed }: DashboardFileTreeProps) {
  const pathname = usePathname();
  
  // Group routes by their sections
  const sections = Object.entries(allowedRoutes).reduce((acc, [path, name]) => {
    if (path.startsWith("/dashboard/")) {
      const section = path.split("/")[2];
      if (!acc[section]) {
        acc[section] = [];
      }
      if (path !== `/dashboard/${section}`) {
        acc[section].push({ path, name });
      }
    }
    return acc;
  }, {} as Record<string, { path: string; name: string }[]>);

  // Sort sections alphabetically
  const sortedSections = Object.keys(sections).sort();
  
  const treeData = sortedSections.map(section => {
    // Sort children alphabetically by name
    const sortedChildren = [...sections[section]].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    
    return {
      name: section.charAt(0).toUpperCase() + section.slice(1),
      path: `/dashboard/${section}`,
      children: sortedChildren
    };
  });

  if (isCollapsed) {
    return null;
  }

  // Determine which section is active based on the current pathname
  const activeSection = pathname.split('/')[2];

  return (
    <motion.div 
      className="p-2 w-full max-w-xs lg:max-w-sm"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {treeData.map((node, index) => (
        <TreeNode 
          key={index} 
          node={node} 
          level={0} 
          activeSection={activeSection}
          currentPath={pathname}
        />
      ))}
    </motion.div>
  );
}

function TreeNode({ 
  node, 
  level, 
  activeSection,
  currentPath
}: { 
  node: TreeNode; 
  level: number;
  activeSection: string;
  currentPath: string;
}) {
  // Determine if this node should be open initially
  const shouldBeOpen = () => {
    // If it's a top-level node (section), check if it matches the active section
    if (level === 0) {
      return node.path.includes(`/dashboard/${activeSection}`);
    }
    // For child nodes, check if the current path starts with this node's path
    // or if this node's path is part of the current path
    return currentPath.startsWith(node.path) || node.path === currentPath;
  };

  const [isOpen, setIsOpen] = useState(shouldBeOpen());
  const router = useRouter();
  
  // Update open state when active section changes
  useEffect(() => {
    setIsOpen(shouldBeOpen());
  }, [activeSection, currentPath]);

  const toggleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleFolderClick = () => {
    router.push(node.path);
  };

  const isActive = currentPath === node.path;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: level * 0.1 }}
    >
      <motion.div
        className={`flex items-center py-2 px-3 rounded-md cursor-pointer ${
          level === 0 ? "font-semibold" : ""
        } ${isActive ? "bg-blue-100" : "hover:bg-gray-100"}`}
        style={{ paddingLeft: `${level * 30 + 12}px` }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {node.children && (
          <div onClick={toggleOpen}>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 mr-1 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1 text-gray-500" />
            )}
          </div>
        )}
        {node.children && (
          <div onClick={toggleOpen}>
            {isOpen ? (
              <FolderOpen className="h-4 w-4 mr-2 text-blue-600" />
            ) : (
              <Folder className="h-4 w-4 mr-2 text-blue-500" />
            )}
          </div>
        )}
        {!node.children && (
          isActive ? (
            <FileText className="h-4 w-4 mr-2 text-green-600" />
          ) : (
            <File className="h-4 w-4 mr-2 text-gray-500" />
          )
        )}
        <Link href={node.path} onClick={node.children ? handleFolderClick : undefined}>
          <span className="text-sm md:text-base break-words">{node.name}</span>
        </Link>
      </motion.div>
      <AnimatePresence>
        {isOpen && node.children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {node.children.map((child, index) => (
              <TreeNode 
                key={index} 
                node={child} 
                level={level + 1} 
                activeSection={activeSection}
                currentPath={currentPath}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
