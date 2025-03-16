// app/components/admin/EnvironmentAccessSelector.tsx
"use client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { environmentsList } from "@/config/environments";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnvironmentSelectorProps {
    allowedEnvironments: { [key: string]: string };
    onAddEnvironment: (envKey: string, envName: string) => void;
    onRemoveEnvironment: (envKey: string) => void;
}

const EnvironmentSelector = ({
    allowedEnvironments,
    onAddEnvironment,
    onRemoveEnvironment,
}: EnvironmentSelectorProps) => {
    return (
        <div className="relative">
            <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                    {Object.entries(allowedEnvironments).map(([key, name]) => (
                        <motion.span
                            key={key}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                            {name}
                            <button
                                onClick={() => onRemoveEnvironment(key)}
                                className="ml-1 hover:text-red-500"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </motion.span>
                    ))}
                </AnimatePresence>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                        {Object.entries(environmentsList)
                            .filter(([key]) => !allowedEnvironments[key])
                            .map(([key, name]) => (
                                <DropdownMenuItem
                                    key={key}
                                    onClick={() => onAddEnvironment(key, name)}
                                >
                                    {name}
                                </DropdownMenuItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export default EnvironmentSelector;
