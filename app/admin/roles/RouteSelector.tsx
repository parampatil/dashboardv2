// components/admin/roles/RouteSelector.tsx
"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

interface RouteSelectorProps {
  category: {
    name: string;
    routes: { path: string; name: string; }[];
  };
  selectedRoutes: { [key: string]: string };
  onChange: (routes: { [key: string]: string }) => void;
}

export function RouteSelector({ category, selectedRoutes, onChange }: RouteSelectorProps) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={category.name}>
        <AccordionTrigger>{category.name}</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 pt-2">
            {category.routes.map((route) => (
              <motion.div
                key={route.path}
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
                whileHover={{ scale: 1.01 }}
              >
                <div>
                  <p className="font-medium">{route.name}</p>
                  <p className="text-sm text-gray-500">{route.path}</p>
                </div>
                <Switch
                  checked={!!selectedRoutes[route.path]}
                  onCheckedChange={(checked) => {
                    const updatedRoutes = { ...selectedRoutes };
                    if (checked) {
                      updatedRoutes[route.path] = route.name;
                    } else {
                      delete updatedRoutes[route.path];
                    }
                    onChange(updatedRoutes);
                  }}
                />
              </motion.div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
