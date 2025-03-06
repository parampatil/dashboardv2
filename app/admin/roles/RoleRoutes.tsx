// // components/admin/roles/RoleRoutes.tsx
// "use client";
// import { motion } from "framer-motion";
// import { Switch } from "@/components/ui/switch";

// interface RoleRoutesProps {
//   routes: { [key: string]: string };
//   isEditing: boolean;
//   onRouteToggle?: (path: string, enabled: boolean) => void;
// }

// export function RoleRoutes({ routes, isEditing, onRouteToggle }: RoleRoutesProps) {
//   const categorizedRoutes = Object.entries(routes).reduce((acc, [path, name]) => {
//     const category = path.split('/')[1] || 'other';
//     if (!acc[category]) {
//       acc[category] = [];
//     }
//     acc[category].push({ path, name });
//     return acc;
//   }, {} as Record<string, { path: string; name: string }[]>);

//   return (
//     <div className="space-y-6">
//       {Object.entries(categorizedRoutes).map(([category, routes]) => (
//         <motion.div
//           key={category}
//           layout
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="rounded-lg bg-gray-50 p-4"
//         >
//           <h4 className="text-lg font-medium capitalize mb-4">{category}</h4>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//             {routes.map(({ path, name }) => (
//               <motion.div
//                 key={path}
//                 className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white rounded-lg shadow-sm"
//                 whileHover={{ scale: 1.02 }}
//               >
//                 <div className="mb-2 sm:mb-0">
//                   <p className="font-medium text-sm">{name}</p>
//                   <p className="text-xs text-gray-500 break-all">{path}</p>
//                 </div>
//                 <Switch
//                   checked={true}
//                   disabled={!isEditing}
//                   onCheckedChange={(checked) => onRouteToggle?.(path, checked)}
//                 />
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>
//       ))}
//     </div>
//   );
// }
