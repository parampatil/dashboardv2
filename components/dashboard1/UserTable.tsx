// app/dashboard/dashboard1/components/UserTable.tsx
import { motion, AnimatePresence } from "framer-motion";
import { formatProtobufTimestamp } from "@/lib/utils";

interface User {
  displayName: string;
  email: string;
  createdTimestamp: { seconds: number | string; nanos: number };
  country: string;
}

interface UserTableProps {
  users: User[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
}

export default function UserTable({ users, loading, currentPage, pageSize }: UserTableProps) {
  if (loading) {
    return (
      <motion.div 
        className="flex justify-center items-center h-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </motion.div>
    );
  }

  return (
    <motion.div 
    className="relative rounded-lg shadow-md h-[70vh]" // Set fixed height
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="overflow-auto h-full rounded-lg"> {/* Single overflow container */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="sticky top-0 bg-gray-50 shadow-sm z-20"> {/* Increased z-index */}
            <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">Sr No</th>
            <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">Display Name</th>
            <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">Email</th>
            <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">Created At</th>
            <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">Country</th>
          </tr>
        </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {users.map((user, index) => (
                <motion.tr 
                  key={user.email}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-gray-50"
                >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.displayName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatProtobufTimestamp(user.createdTimestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.country}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
