// app/components/dashboard/DashboardFileTree.tsx
"use client";
import React, { useState } from "react";
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

  const treeData = Object.entries(sections).map(([section, routes]) => ({
    name: section.charAt(0).toUpperCase() + section.slice(1),
    path: `/dashboard/${section}`,
    children: routes
  }));

  if (isCollapsed) {
    return null;
  }

  return (
    <motion.div 
      className="p-2 w-full max-w-xs lg:max-w-sm"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {treeData.map((node, index) => (
        <TreeNode key={index} node={node} level={0} />
      ))}
    </motion.div>
  );
}

function TreeNode({ node, level }: { node: TreeNode; level: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleFolderClick = () => {
    router.push(node.path);
  };

  const isActive = pathname === node.path;

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
        style={{ paddingLeft: `${level * 20 + 12}px` }}
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
          <span className="text-sm md:text-base truncate">{node.name}</span>
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
              <TreeNode key={index} node={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
