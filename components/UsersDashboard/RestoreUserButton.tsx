// components/UsersDashboard/RestoreUserButton.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle, // Added DialogTitle
    DialogDescription,
    DialogFooter,
    DialogClose, // Added DialogClose
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { RotateCcw, Loader2 } from "lucide-react"; // Added Loader2

export function RestoreUserButton({ userId }: { userId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const { toast } = useToast();
    const api = useApi();

    const handleRestore = async () => {
        setIsRestoring(true);
        try {
            // Assuming you have an API endpoint for restoring users
            // Replace with your actual API call for restoring
            const response = await api.fetch("/api/grpc/users/restore", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }), // Ensure your API expects { userId: string }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Restoration failed");
            }

            toast({
                title: "User Restored",
                description: "The user was restored successfully.",
            });
            setIsOpen(false); // Close dialog on success
            // Consider a callback to refresh the user list
            setTimeout(() => {
                window.location.reload();
            }, 1200);
        } catch (error: Error | unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to restore user.";
            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
            });
        } finally {
            setIsRestoring(false);
           // setIsOpen(false); // Ensure dialog closes even on error if desired
        }
    };

    return (
        <>
            <Button 
                variant="outline" 
                size="sm" 
                className="bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 border-green-200 h-8 px-2 text-xs" // Adjusted size
                onClick={() => setIsOpen(true)}
            >
                <RotateCcw className="h-3 w-3 mr-1" /> Restore
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        {/* Added DialogTitle for accessibility */}
                        <DialogTitle>Confirm User Restoration</DialogTitle>
                        <DialogDescription>
                            This action will restore the soft-deleted user. Are you sure you want to continue?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start gap-2 pt-4"> {/* Added gap and pt */}
                        <Button
                            variant="default"
                            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                            onClick={handleRestore}
                            disabled={isRestoring}
                        >
                            {isRestoring ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RotateCcw className="h-4 w-4 mr-2" />}
                            {isRestoring ? "Restoring..." : "Confirm Restore"}
                        </Button>
                        <DialogClose asChild>
                            <Button variant="outline" className="w-full sm:w-auto" disabled={isRestoring}>
                                Cancel
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
