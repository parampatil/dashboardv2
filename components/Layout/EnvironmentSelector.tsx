// components/Layout/EnvironmentSelector.tsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useEnvironment } from "@/context/EnvironmentContext";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as PopoverPrimitive from "@radix-ui/react-popover"; // Import PopoverPrimitive for direct control

interface EnvironmentSelectorProps {
  isExpanded?: boolean; 
}

export function EnvironmentSelector({ isExpanded = true }: EnvironmentSelectorProps) {
  const { currentEnvironment, setEnvironment, availableEnvironments } = useEnvironment();
  const [isSelectOpen, setIsSelectOpen] = React.useState(false);


  const getEnvIndicatorColor = (envKey: string) => {
    switch (envKey) {
      case "dev": return "bg-blue-500 hover:bg-blue-600";
      case "preprod": return "bg-amber-500 hover:bg-amber-600";
      case "prod": return "bg-green-500 hover:bg-green-600";
      default: return "bg-slate-400 hover:bg-slate-500";
    }
  };
   const getEnvTextColor = (envKey: string) => {
    switch (envKey) {
    case "dev": return "text-white hover:text-white";
      case "preprod": return "text-black hover:text-black";
      case "prod": return "text-white hover:text-white";
    default: return "text-white";
    }
  };


  const sortedEnvironments = Object.entries(availableEnvironments).sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

  if (!isExpanded) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center w-full h-9 px-2 cursor-default">
              <span 
                className={cn("h-3 w-3 rounded-full shrink-0", getEnvIndicatorColor(currentEnvironment))}
                aria-label={`Current environment: ${availableEnvironments[currentEnvironment]}`}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" align="center" sideOffset={10}>
            <p>Env: {availableEnvironments[currentEnvironment]}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="w-full">
        {/* Using PopoverPrimitive directly to gain more control, especially for `modal={false}`.
            Shadcn's Select wraps Popover, but doesn't expose all Popover props directly.
        */}
      <PopoverPrimitive.Root open={isSelectOpen} onOpenChange={setIsSelectOpen}>
        <PopoverPrimitive.Trigger asChild>
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={isSelectOpen}
                className={cn(
                    "w-full h-9 text-xs justify-between focus:ring-primary focus:ring-1", 
                    getEnvIndicatorColor(currentEnvironment), 
                    getEnvTextColor(currentEnvironment),
                    "border-transparent hover:opacity-90" // Use border-transparent if bg provides outline
                )}
                aria-label={`Select environment, current is ${availableEnvironments[currentEnvironment]}`}
            >
                <div className="flex items-center gap-1.5 truncate">
                    <span className="font-medium">Env:</span>
                    <span className="truncate">{availableEnvironments[currentEnvironment]}</span>
                </div>
                 <ChevronDown className="h-4 w-4 opacity-75 shrink-0" />
            </Button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Content
            className="w-[var(--radix-popover-trigger-width)] p-1 z-[100] bg-white border shadow-md rounded-md" // Ensure high z-index
            side="top" // Prefer 'top' or 'bottom' to avoid sidebar hover issues
            align="start"
            sideOffset={5}
            onOpenAutoFocus={(e) => e.preventDefault()} // Prevent focus stealing if sidebar is trying to close
            onCloseAutoFocus={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => {
                // This helps prevent the sidebar from closing when clicking inside the SelectContent
                // if the sidebar relies on focus-out or click-outside to close when hovered.
                e.preventDefault(); 
            }}
        >
          {sortedEnvironments.map(([key, name]) => (
            <Button
                key={key}
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2 my-0.5"
                onClick={() => {
                    setEnvironment(key as "dev" | "preprod" | "prod");
                    setIsSelectOpen(false); // Close select on item click
                }}
            >
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", getEnvIndicatorColor(key))} />
                {name}
              </div>
            </Button>
          ))}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Root>
    </div>
  );
}

