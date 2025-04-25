"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

export default function PreviewDialog({
  geohashes,
  previewGeohash,
  setPreviewGeohash,
}: {
  geohashes: string[];
  previewGeohash: string | null;
  setPreviewGeohash: (hash: string | null) => void;
}) {
  return (
    <Dialog open={!!previewGeohash} onOpenChange={() => setPreviewGeohash(null)}>
      <DialogContent className="max-w-full h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center h-fit gap-4">
            <button
              onClick={() => {
                const currentIndex = geohashes.indexOf(previewGeohash!);
                const newIndex = (currentIndex - 1 + geohashes.length) % geohashes.length;
                setPreviewGeohash(geohashes[newIndex]);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="font-mono">{previewGeohash}</span>

            <button
              onClick={() => {
                const currentIndex = geohashes.indexOf(previewGeohash!);
                const newIndex = (currentIndex + 1) % geohashes.length;
                setPreviewGeohash(geohashes[newIndex]);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </DialogTitle>
        </DialogHeader>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 rounded-lg overflow-hidden"
        >
          <iframe
            src={`https://geohash.softeng.co/${previewGeohash}`}
            className="w-full h-full border-0"
            title={previewGeohash!}
            loading="lazy"
          />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
