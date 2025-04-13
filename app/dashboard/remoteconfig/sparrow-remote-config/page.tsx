"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface RemoteConfig {
  parameters: Record<string, { defaultValue: { value: string } }>;
}

export default function Dashboard() {
  const [remoteConfig, setRemoteConfig] = useState<RemoteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [featureValues, setFeatureValues] = useState<Record<string, string>>(
    {}
  );
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    async function fetchRemoteConfig() {
      try {
        const response = await fetch("/api/remote-config/get");
        const data = await response.json();
        setRemoteConfig(data);

        const initialValues: Record<string, string> = {};
        Object.keys(data.parameters).forEach((key) => {
          initialValues[key] = (data.parameters[key]?.defaultValue?.value ||
            "") as string;
        });
        setFeatureValues(initialValues);
      } catch (error) {
        console.error("Error fetching Remote Config:", error);
        toast({
          variant: "destructive",
          title: "Error loading configuration",
          description:
            "Failed to load remote configuration. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchRemoteConfig();
  }, [toast]);

  const handleToggleChange = (key: string, value: string) => {
    setFeatureValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateRemoteConfig = async () => {
    setUpdating(true);
    try {
      const response = await fetch("/api/remote-config/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ parameters: featureValues }),
      });

      if (response.ok) {
        toast({
          title: "Configuration updated",
          description:
            "Remote Config parameters have been successfully updated.",
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update Remote Config");
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setUpdating(false);
    }
  };

  const filteredParameters = remoteConfig?.parameters
    ? Object.entries(remoteConfig.parameters).filter(([key]) =>
        key.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const booleanParameters = filteredParameters.filter(
    ([, param]) =>
      param.defaultValue.value === "true" ||
      param.defaultValue.value === "false"
  );

  const stringParameters = filteredParameters.filter(
    ([, param]) =>
      param.defaultValue.value !== "true" &&
      param.defaultValue.value !== "false"
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute
      allowedRoutes={["/dashboard/remoteconfig/sparrow-remote-config"]}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Remote Config</h1>
            <p className="text-muted-foreground mt-1">
              Manage feature flags and configuration parameters
            </p>
          </div>
          <Button
            onClick={updateRemoteConfig}
            disabled={updating}
            className="shrink-0"
          >
            {updating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish Changes"
            )}
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search parameters..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all">
              All Parameters ({filteredParameters.length})
            </TabsTrigger>
            <TabsTrigger value="feature-flags">
              Feature Flags ({booleanParameters.length})
            </TabsTrigger>
            <TabsTrigger value="values">
              Values ({stringParameters.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredParameters.map(([key, param]) => (
                <ParameterCard
                  key={key}
                  name={key}
                  value={featureValues[key]}
                  isBoolean={
                    param.defaultValue.value === "true" ||
                    param.defaultValue.value === "false"
                  }
                  onChange={handleToggleChange}
                />
              ))}
            </div>
            {filteredParameters.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No parameters found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="feature-flags" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {booleanParameters.map(([key]) => (
                <ParameterCard
                  key={key}
                  name={key}
                  value={featureValues[key]}
                  isBoolean={true}
                  onChange={handleToggleChange}
                />
              ))}
            </div>
            {booleanParameters.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No feature flags found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="values" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {stringParameters.map(([key]) => (
                <ParameterCard
                  key={key}
                  name={key}
                  value={featureValues[key]}
                  isBoolean={false}
                  onChange={handleToggleChange}
                />
              ))}
            </div>
            {stringParameters.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No value parameters found
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </ProtectedRoute>
  );
}

interface ParameterCardProps {
  name: string;
  value: string;
  isBoolean: boolean;
  onChange: (key: string, value: string) => void;
}

function ParameterCard({
  name,
  value,
  isBoolean,
  onChange,
}: ParameterCardProps) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      exit={{ scale: 0.95, opacity: 0 }}
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2 flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base font-medium">{name}</CardTitle>
              <CardDescription className="text-xs mt-1">
                Parameter key: {name}
              </CardDescription>
            </div>
            {isBoolean && (
              <Badge variant={value === "true" ? "default" : "outline"}>
                {value === "true" ? "Enabled" : "Disabled"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {isBoolean
                ? value === "true"
                  ? "Enabled"
                  : "Disabled"
                : "Value"}
            </span>
            {isBoolean ? (
              <Switch
                checked={value === "true"}
                onCheckedChange={(checked) =>
                  onChange(name, checked ? "true" : "false")
                }
              />
            ) : (
              <Input
                type="text"
                value={value}
                onChange={(e) => onChange(name, e.target.value)}
                className="w-2/3 text-right"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
