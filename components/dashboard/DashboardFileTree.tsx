// components/dashboard/DashboardFileTree.tsx
import { Tree, File, Folder } from "@/components/ui/tree-view";
import { ROUTES } from "@/config/routes";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardFileTreeProps {
  isCollapsed: boolean;
  allowedRoutes: { [key: string]: string };
}

export function DashboardFileTree({ isCollapsed, allowedRoutes }: DashboardFileTreeProps) {
  const pathname = usePathname();

  // Group routes by their sections
  const sections = {
    users: ROUTES.PROTECTED.filter(route => 
      route.path.startsWith("/dashboard/users/") && 
      Object.keys(allowedRoutes).includes(route.path)
    ),
    customerSupport: ROUTES.PROTECTED.filter(route => 
      route.path.startsWith("/dashboard/customersupport/") && 
      Object.keys(allowedRoutes).includes(route.path)
    ),
    devops: ROUTES.PROTECTED.filter(route => 
      route.path.startsWith("/dashboard/devops/") && 
      Object.keys(allowedRoutes).includes(route.path)
    ),
    analytics: ROUTES.PROTECTED.filter(route => 
      route.path.startsWith("/dashboard/analytics/") && 
      Object.keys(allowedRoutes).includes(route.path)
    ),
    rewards: ROUTES.PROTECTED.filter(route => 
      route.path.startsWith("/dashboard/rewards/") && 
      Object.keys(allowedRoutes).includes(route.path)
    ),
    ConsumerPurchase: ROUTES.PROTECTED.filter(route =>
      route.path.startsWith("/dashboard/consumerpurchase/") &&
      Object.keys(allowedRoutes).includes(route.path)
    )
  };

  const treeElements = [
    {
      id: "dashboard",
      name: "Dashboards",
      children: Object.entries(sections).map(([section, routes]) => ({
        id: section,
        name: section.charAt(0).toUpperCase() + section.slice(1),
        children: routes.map(route => ({
          id: route.path,
          name: route.name,
          isSelectable: true
        }))
      }))
    }
  ];

  return (
    <Tree
      className="h-[calc(100vh-12rem)]"
      elements={treeElements}
      initialExpandedItems={["dashboard"]}
    >
      <Folder element="Dashboards" value="dashboard">
        {/* Users Section */}
        {sections.users.length > 0 && (
          <Folder element="Users" value="users">
            {sections.users.map((route) => (
              <Link key={route.path} href={route.path}>
                <File
                  value={route.path}
                  isSelect={pathname === route.path}
                  className="px-2 py-1"
                >
                  {!isCollapsed ? route.name : ""}
                </File>
              </Link>
            ))}
          </Folder>
        )}

        {/* Rewards Section */}
        {sections.rewards.length > 0 && (
          <Folder element="Rewards" value="rewards">
            {sections.rewards.map((route) => (
              <Link key={route.path} href={route.path}>
                <File
                  value={route.path}
                  isSelect={pathname === route.path}
                  className="px-2 py-1"
                >
                  {!isCollapsed ? route.name : ""}
                </File>
              </Link>
            ))}
          </Folder>
        )}

        {/* Customer Support Section */}
        {sections.customerSupport.length > 0 && (
          <Folder element="Customer Support" value="customerSupport">
            {sections.customerSupport.map((route) => (
              <Link key={route.path} href={route.path}>
                <File
                  value={route.path}
                  isSelect={pathname === route.path}
                  className="px-2 py-1"
                >
                  {!isCollapsed ? route.name : ""}
                </File>
              </Link>
            ))}
          </Folder>
        )}

        {/* DevOps Section */}
        {sections.devops.length > 0 && (
          <Folder element="DevOps" value="devops">
            {sections.devops.map((route) => (
              <Link key={route.path} href={route.path}>
                <File
                  value={route.path}
                  isSelect={pathname === route.path}
                  className="px-2 py-1"
                >
                  {!isCollapsed ? route.name : ""}
                </File>
              </Link>
            ))}
          </Folder>
        )}

        {/* Analytics Section */}
        {sections.analytics.length > 0 && (
          <Folder element="Analytics" value="analytics">
            {sections.analytics.map((route) => (
              <Link key={route.path} href={route.path}>
                <File
                  value={route.path}
                  isSelect={pathname === route.path}
                  className="px-2 py-1"
                >
                  {!isCollapsed ? route.name : ""}
                </File>
              </Link>
            ))}
          </Folder>
        )}

        {/* Customer Purchase Section */}
        {sections.ConsumerPurchase.length > 0 && (
          <Folder element="Consumer Purchase" value="ConsumerPurchase">
            {sections.ConsumerPurchase.map((route) => (
              <Link key={route.path} href={route.path}>
                <File
                  value={route.path}
                  isSelect={pathname === route.path}
                  className="px-2 py-1"
                >
                  {!isCollapsed ? route.name : ""}
                </File>
              </Link>
            ))}
          </Folder>
        )}

      </Folder>
    </Tree>
  );
}
