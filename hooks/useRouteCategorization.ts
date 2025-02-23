// hooks/useRouteCategorization.ts
import { ROUTES } from "@/config/routes";

interface RouteCategory {
  name: string;
  routes: { path: string; name: string; }[];
}

export function useRouteCategorization() {
  const categorizeRoutes = () => {
    const categories: { [key: string]: RouteCategory } = {
      dashboard: { name: "Dashboard", routes: [] },
      admin: { name: "Admin", routes: [] },
      other: { name: "Other", routes: [] }
    };

    ROUTES.PROTECTED.forEach(route => {
      if (route.path.startsWith("/dashboard/")) {
        const subCategory = route.path.split("/")[2];
        const categoryKey = `dashboard_${subCategory}`;
        
        if (!categories[categoryKey]) {
          categories[categoryKey] = {
            name: `Dashboard - ${subCategory.charAt(0).toUpperCase() + subCategory.slice(1)}`,
            routes: []
          };
        }
        categories[categoryKey].routes.push(route);
      } else if (route.path.startsWith("/admin/")) {
        categories.admin.routes.push(route);
      } else {
        categories.other.routes.push(route);
      }
    });

    return Object.values(categories).filter(category => category.routes.length > 0);
  };

  return { categories: categorizeRoutes() };
}

