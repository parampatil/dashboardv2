// components/admin/AutoInviteToggle.tsx
"use client";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { setAutoInviteEnabled, getAutoInviteEnabled } from "@/lib/remote-config";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export function AutoInviteToggle() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getAutoInviteEnabled().then(setEnabled).finally(() => setLoading(false));
  }, []);

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      await setAutoInviteEnabled(checked);
      setEnabled(checked);
      toast({
        title: "Auto-invite updated",
        description: `Auto-invite is now ${checked ? "enabled" : "disabled"}.`
      });
    } catch {
      toast({ variant: "destructive", title: "Failed to update auto-invite" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Skeleton className="h-6 w-12" />;
  return (
    <div className="flex items-center gap-4">
      <Switch id="auto-invite" checked={enabled} onCheckedChange={handleToggle} />
      <Label htmlFor="auto-invite">Allow users to request access from login</Label>
    </div>
  );
}
