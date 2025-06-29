// app/dashboard/affiliate/affiliate-requests/UserSelectionDialog.tsx
"use client";
import { useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { UserIdNameMapping } from "@/types/grpc";

interface UserSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (userId: string) => void;
    userMapping: UserIdNameMapping;
}

export default function UserSelectionDialog({
    open,
    onOpenChange,
    onSelect,
    userMapping,
}: UserSelectionDialogProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return Object.entries(userMapping);
        return Object.entries(userMapping).filter(
            ([userId, userName]) =>
                userId.includes(searchTerm) ||
                (userName && userName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [userMapping, searchTerm]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle>Select a User</DialogTitle>
                    <div className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search users..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                        {searchTerm && (
                            <X
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 cursor-pointer"
                                onClick={() => setSearchTerm("")}
                            />
                        )}
                    </div>
                </DialogHeader>

                <div className="mt-2 max-h-[50vh] overflow-y-auto px-4 pb-6">
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No matching users found
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredUsers.map(([userId, userName]) => (
                                <motion.div
                                    key={userId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full h-14 justify-start px-4 text-left"
                                        onClick={() => {
                                            onSelect(userId);
                                            onOpenChange(false);
                                        }}
                                    >
                                        <div className="truncate">
                                            <div className="font-medium truncate">
                                                {userName || userId}
                                            </div>
                                            {userName && (
                                                <div className="text-xs text-gray-500 truncate">
                                                    ID: {userId}
                                                </div>
                                            )}
                                        </div>
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
