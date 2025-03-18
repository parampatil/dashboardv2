// context/EnvironmentContext.tsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  environments,
  environmentsList,
  defaultEnvironment,
} from "@/config/environments";

// Get the default environment key from the defaultEnvironment object
const DEFAULT_ENV = Object.keys(
  defaultEnvironment
)[0] as keyof typeof environments;

type Environment = keyof typeof environments;

interface EnvironmentContextType {
  currentEnvironment: Environment;
  setEnvironment: (env: Environment) => void;
  availableEnvironments: { [key: string]: string };
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(
  undefined
);

export function EnvironmentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [currentEnvironment, setCurrentEnvironment] =
    useState<Environment>(DEFAULT_ENV);
  const [availableEnvironments, setAvailableEnvironments] = useState<{
    [key: string]: string;
  }>({
    [DEFAULT_ENV]: `Default (${environmentsList[DEFAULT_ENV]})`,
  });

  useEffect(() => {
    const savedEnv = localStorage.getItem(
      "currentEnvironment"
    ) as Environment | null;

    if (
      user?.allowedEnvironments &&
      Object.keys(user.allowedEnvironments).length > 0
    ) {
      // User has specific environment permissions
      setAvailableEnvironments(user.allowedEnvironments);

      // Set environment based on priority: saved (if allowed) > first allowed
      const newEnv =
        savedEnv && user.allowedEnvironments[savedEnv]
          ? savedEnv
          : (Object.keys(user.allowedEnvironments)[0] as Environment);

      setCurrentEnvironment(newEnv);
    } else {
      // No specific permissions, use default
      setAvailableEnvironments({
        [DEFAULT_ENV]: `Default (${environmentsList[DEFAULT_ENV]})`,
      });
      setCurrentEnvironment(DEFAULT_ENV);
    }
  }, [user]);

  const setEnvironment = (env: Environment) => {
    if (availableEnvironments[env]) {
      console.log("Setting environment to:", env);
      setCurrentEnvironment(env);
      try {
        localStorage.setItem("currentEnvironment", env);
      } catch (error) {
        console.error("Failed to save environment to localStorage:", error);
      }
    }
  };

  return (
    <EnvironmentContext.Provider
      value={{ currentEnvironment, setEnvironment, availableEnvironments }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
}

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error(
      "useEnvironment must be used within an EnvironmentProvider"
    );
  }
  return context;
};
