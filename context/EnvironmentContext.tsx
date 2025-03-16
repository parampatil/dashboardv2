// context/EnvironmentContext.tsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { environments, environmentsList } from "@/config/environments";

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
  const [currentEnvironment, setCurrentEnvironment] = useState<Environment>("dev");
  const [availableEnvironments, setAvailableEnvironments] = useState<{ [key: string]: string }>({
    dev: "Development"
  });

  useEffect(() => {
    // If user has allowed environments, use those
    if (user?.allowedEnvironments && Object.keys(user.allowedEnvironments).length > 0) {
      setAvailableEnvironments(user.allowedEnvironments);
      
      // Set to first allowed environment or stay with current if it's allowed
      if (user.allowedEnvironments[currentEnvironment]) {
        // Keep current environment
      } else {
        // Set to first available environment
        const firstEnvKey = Object.keys(user.allowedEnvironments)[0] as Environment;
        setCurrentEnvironment(firstEnvKey);
      }
    } else {
      // Default to just dev environment if no specific permissions
      setAvailableEnvironments({ dev: environmentsList.dev });
      setCurrentEnvironment("dev");
    }
  }, [user, currentEnvironment]);

  const setEnvironment = (env: Environment) => {
    setCurrentEnvironment(env);
    localStorage.setItem("currentEnvironment", env);
  };

  return (
    <EnvironmentContext.Provider
      value={{ 
        currentEnvironment, 
        setEnvironment, 
        availableEnvironments 
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
}

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error(
      "useEnvironment must be used within an EnvironmentProvider"
    );
  }
  return context;
};
