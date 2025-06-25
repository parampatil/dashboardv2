"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Map } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/hooks/useApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PreviewDialog from "@/components/LocationDashboard/GeoHashPreviewDialog";
import AddGeohashDialog from "@/components/LocationDashboard/AddGeohashDialog";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useEnvironment } from "@/context/EnvironmentContext";

export default function DenyListPage() {
  const { toast } = useToast();
  const [geohashes, setGeohashes] = useState<string[]>([]);
  const [inputGeohashes, setInputGeohashes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewGeohash, setPreviewGeohash] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const api = useApi();
    const { currentEnvironment } = useEnvironment();

  useEffect(() => {
    const fetchGeohashes = async () => {
      try {
        const res = await api.fetch("/api/grpc/deny-list/get-geohash");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setGeohashes(data.geohashes);
      } catch (err) {
        console.error("Error fetching geohashes:", err);
        setError("Failed to load geohash data");
        toast({
          variant: "destructive",
          title: "Loading Error",
          description: "Could not fetch deny list data",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchGeohashes();
  }, [currentEnvironment]);

  const handleBulkAdd = async () => {
    const newHashes = inputGeohashes
      .split(/[\n,]+/)
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    if (newHashes.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter valid geohashes",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.fetch("/api/grpc/deny-list/insert-geohash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geohashes: newHashes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add geohashes");
      }

      setGeohashes((prev) => [...new Set([...prev, ...newHashes])]);
      setInputGeohashes("");
      setAddDialogOpen(false);
      toast({
        title: "Success",
        description: `${newHashes.length} geohashes added to deny list`,
      });
    } catch (error) {
      console.error("Add error:", error);
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description:
          error instanceof Error ? error.message : "Failed to add geohashes",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    const hashesToDelete = Array.from(selectedRows);
    if (hashesToDelete.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${hashesToDelete.length} geohashes?`
      )
    )
      return;

    try {
      const response = await api.fetch("/api/grpc/deny-list/delete-geohash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geohashes: hashesToDelete }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete geohashes");
      }

      setGeohashes((prev) => prev.filter((g) => !selectedRows.has(g)));
      setSelectedRows(new Set());
      toast({
        title: "Success",
        description: `${hashesToDelete.length} geohashes removed from deny list`,
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description:
          error instanceof Error ? error.message : "Failed to delete geohashes",
      });
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        {error} - Please refresh the page or contact support
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoutes={["/dashboard/location/deny-list"]}>
      <div className="p-6 space-y-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold"
          >
            Banned Geohash Areas
          </motion.h1>

          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={selectedRows.size === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedRows.size})
            </Button>

            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Geohashes
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === geohashes.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(new Set(geohashes));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Geohash</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {geohashes.map((geohash) => (
                  <motion.tr
                    key={geohash}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="group"
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(geohash)}
                        onChange={(e) => {
                          const newSelection = new Set(selectedRows);
                          if (e.target.checked) {
                            newSelection.add(geohash);
                          } else {
                            newSelection.delete(geohash);
                          }
                          setSelectedRows(newSelection);
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-mono">{geohash}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewGeohash(geohash)}
                      >
                        <Map className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRows(new Set([geohash]));
                          handleBulkDelete();
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        )}

        <PreviewDialog
          geohashes={geohashes}
          previewGeohash={previewGeohash}
          setPreviewGeohash={setPreviewGeohash}
        />

        <AddGeohashDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          inputGeohashes={inputGeohashes}
          setInputGeohashes={setInputGeohashes}
          onSubmit={handleBulkAdd}
          isSubmitting={isSubmitting}
        />
      </div>
    </ProtectedRoute>
  );
}
