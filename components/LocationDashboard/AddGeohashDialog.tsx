"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function AddGeohashDialog({
  open,
  onOpenChange,
  inputGeohashes,
  setInputGeohashes,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inputGeohashes: string;
  setInputGeohashes: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentGeohash, setCurrentGeohash] = useState("");

  // Listen for iframe URL changes
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        if (event.origin !== "https://parampatil.github.io") return;
        
        if (event.data?.geohash) {
            const newGeohash = event.data.geohash;
            setCurrentGeohash(newGeohash);
        }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
}, []);
  

const captureCurrentGeohash = () => {
    if (!currentGeohash) {
        toast({ variant: "destructive", title: "Error", description: "No geohash detected" });
        return;
    }
    
    const hashes = new Set(inputGeohashes.split(/[\n,]+/).filter(Boolean));
    hashes.add(currentGeohash);
    setInputGeohashes(Array.from(hashes).join('\n'));
    toast({ title: 'Geohash Captured', description: 'Added to input list' });
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Banned Geohashes</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col md:flex-row gap-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border rounded-lg overflow-hidden flex-1"
          >
            <iframe
              ref={iframeRef}
              src="https://parampatil.github.io/geohashmap/"
              className="w-full h-full border-0"
              title="geohash-picker"
              sandbox="allow-scripts allow-same-origin"
            />
          </motion.div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button onClick={captureCurrentGeohash}>
                Add Current Geohash ({currentGeohash || 'none'})
              </Button>
            </div>

            <label className="text-sm font-medium">
              Selected Geohashes (one per line or comma-separated):
            </label>
            
            <textarea
              value={inputGeohashes}
              onChange={(e) => setInputGeohashes(e.target.value)}
              placeholder="Enter geohashes or select from map above..."
              className="w-full h-32 p-2 border rounded-md font-mono text-sm"
              disabled={isSubmitting}
            />
            
            <Button
              onClick={onSubmit}
              disabled={!inputGeohashes.trim() || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Adding..." : `Add ${inputGeohashes.split(/[\n,]+/).filter(Boolean).length} Geohashes`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
