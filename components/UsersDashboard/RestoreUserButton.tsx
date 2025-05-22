"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

export function RestoreUserButton({ userId }: { userId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const { toast } = useToast();
    const api = useApi();

    const handleRestore = async () => {
        setIsRestoring(true);
        try {
            const response = await api.fetch("/api/grpc/users/restore", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Restoration failed");
            }

            toast({
                title: "User Restored",
                description: "The user was restored successfully.",
            });

            // Wait a moment so the toast is visible before refresh
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
            setIsOpen(false);
        }
    };

    return (
        <>
            <Button variant="outline" size="sm" className="bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800" onClick={() => setIsOpen(true)}>
                Restore
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm User Restoration</DialogTitle>
                        <DialogDescription>
                            This action will restore the deleted user. Are you sure you want to continue?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleRestore}
                            disabled={isRestoring}
                        >
                            {isRestoring ? "Restoring..." : "Confirm Restore"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}