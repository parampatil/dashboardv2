// components/UsersDashboard/UserTable.tsx
import { motion, AnimatePresence } from "framer-motion";
import { formatProtobufTimestamp } from "@/lib/utils";
import { User } from "@/types/grpc";

interface UserTableUser extends User {
  viewButton: React.ReactNode;
} 

interface UserTableProps {
  users: UserTableUser[]; // Changed to User[] to accommodate the added viewButton
  loading: boolean;
  currentPage: number;
  pageSize: number;
  selectedUserId?: string | null;
  extraColumns?: { header: string; accessor: string }[];
}

export default function UserTable({
  users,
  loading,
  currentPage,
  pageSize,
  selectedUserId,
}: UserTableProps) {
  return (
    <motion.div
      className="relative flex-1 bg-white rounded-lg shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="overflow-x-auto overflow-y-hidden rounded-lg"
        initial={{ height: "auto" }}
        animate={{ height: loading ? "400px" : "auto" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {loading ? (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="text-sm text-gray-500">Loading data...</p>
            </div>
          </motion.div>
        ) : null}

        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="sticky top-0 bg-gray-50 shadow-sm z-20">
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">Sr No</th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">User Id</th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">Display Name</th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">Created At</th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">Country</th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence mode="wait">
              {users.map((user, index) => (
                <motion.tr
                  key={`user-${user.userId}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ 
                    duration: 0.2,
                    delay: index * 0.03,
                    ease: "easeOut"
                  }}
                  className={`hover:bg-gray-50 ${
                    selectedUserId === user.userId ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.displayName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatProtobufTimestamp(user.createdTimestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.viewButton}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}
