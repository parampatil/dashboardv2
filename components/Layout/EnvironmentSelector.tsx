// components/Layout/EnvironmentSelector.tsx
"use client";
import { useEnvironment } from "@/context/EnvironmentContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function EnvironmentSelector() {
  const { currentEnvironment, setEnvironment, availableEnvironments } = useEnvironment();

  const getBadgeColor = (env: string) => {
    switch (env) {
      case "dev": return "bg-blue-500";
      case "preprod": return "bg-amber-500";
      case "prod": return "bg-red-500";
      default: return "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select 
        value={currentEnvironment} 
        onValueChange={(value) => setEnvironment(value as "dev" | "preprod" | "prod")}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select environment">
            {currentEnvironment && (
              <div className="flex items-center gap-2">
                <Badge className={getBadgeColor(currentEnvironment)}>
                  {availableEnvironments[currentEnvironment]}
                </Badge>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(availableEnvironments).map(([key, name]) => (
            <SelectItem key={key} value={key}>
                  {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
