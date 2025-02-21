// components/admin/RouteTag.tsx
import { X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RouteTagProps {
  name: string;
  path: string;
  onRemove?: () => void;
  showRemove?: boolean;
}

export function RouteTag({ name, path, onRemove, showRemove = false }: RouteTagProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {name}
            {showRemove && (
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove?.();
                }}
              />
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{path}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
