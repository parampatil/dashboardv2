// components/UsersDashboard/UserProfileDetails.tsx
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { User, UpdateUserDetailsRequest } from '@/types/grpc';
import { useToast } from '@/hooks/use-toast';

interface UserProfileDetailsProps {
  userData: User;
  onProfileUpdate: () => void;
}

const animationVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export function UserProfileDetails({ userData, onProfileUpdate }: UserProfileDetailsProps) {
  const { user: adminUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [originalData, setOriginalData] = useState<User>(userData);
  const [formData, setFormData] = useState<UpdateUserDetailsRequest>({
    userId: Number(userData.userId),
    userName: userData.userName || '',
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    email: userData.email || '',
    phoneNumber: userData.phoneNumber || '',
    country: userData.country || '',
    isActive: userData.isActive || false,
    updatedBy: adminUser?.email || 'system',
  });

  useEffect(() => {
    setOriginalData(userData);
    setFormData({
      userId: Number(userData.userId),
      userName: userData.userName || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      phoneNumber: userData.phoneNumber || '',
      country: userData.country || '',
      isActive: userData.isActive || false,
      updatedBy: adminUser?.email || 'system',
    });
  }, [userData, adminUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      userId: Number(originalData.userId),
      userName: originalData.userName || '',
      firstName: originalData.firstName || '',
      lastName: originalData.lastName || '',
      email: originalData.email || '',
      phoneNumber: originalData.phoneNumber || '',
      country: originalData.country || '',
      isActive: originalData.isActive || false,
      updatedBy: adminUser?.email || 'system',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/grpc/profile/update-user-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        toast({ title: 'Success', description: 'User details updated successfully' });
        onProfileUpdate();
        setIsEditing(false);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update user details' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="p-6 bg-white rounded-xl shadow-sm border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <motion.h2 layout className="text-2xl font-semibold text-gray-800">
          User Profile
        </motion.h2>
        
        <motion.div layout>
          {!isEditing ? (
            <Button
              variant="default"
              onClick={() => setIsEditing(true)}
              className="group"
              disabled={isLoading}
            >
              <span className="mr-2">✏️</span>
              Edit Profile
              <motion.span
                className="ml-2 opacity-0 group-hover:opacity-100"
                initial={{ x: -5 }}
                animate={{ x: 0 }}
              >
                ✨
              </motion.span>
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" form="profileForm" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      <form id="profileForm" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {/* User ID Field */}
            <motion.div
              key="userId"
              className="space-y-1"
              variants={animationVariants}
            >
              <label className="text-sm font-medium text-gray-600">User ID</label>
              <div className="p-2 rounded-md bg-gray-50 border border-gray-200">
                {userData.userId}
              </div>
            </motion.div>

            {/* Editable Fields */}
            {['userName', 'firstName', 'lastName', 'email', 'phoneNumber', 'country'].map((field) => (
              <motion.div
                key={field}
                className="space-y-1"
                variants={animationVariants}
                transition={{ duration: 0.2 }}
              >
                <label className="text-sm font-medium text-gray-600">
                  {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                {isEditing ? (
                  <motion.div
                    initial={{ scale: 0.98 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Input
                      name={field}
                      value={formData[field as keyof typeof formData]?.toString() || ''}
                      onChange={handleInputChange}
                      className="focus:ring-2 focus:ring-blue-200"
                      required={field === 'email' || field === 'userName'}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    className="p-2 rounded-md bg-gray-50 border border-gray-200"
                    initial={{ backgroundColor: '#fff' }}
                    animate={{ backgroundColor: '#f9fafb' }}
                  >
                    {formData[field as keyof typeof formData] || 'N/A'}
                  </motion.div>
                )}
              </motion.div>
            ))}

            {/* Account Status */}
            <motion.div className="space-y-1" variants={animationVariants}>
              <label className="text-sm font-medium text-gray-600">Account Status</label>
              {isEditing ? (
                <motion.div
                  className="flex items-center gap-3 p-2 bg-gray-50 rounded-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isActive: checked }))
                    }
                  />
                  <span className={formData.isActive ? 'text-green-600' : 'text-red-600'}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </motion.div>
              ) : (
                <div className={`p-2 rounded-md ${userData.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {userData.isActive ? 'Active' : 'Inactive'}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {isEditing && (
          <motion.div
            className="mt-8 border-t border-gray-100 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex justify-end gap-4">
              <span className="text-sm text-gray-500">
                Updated by: {adminUser?.email || 'System Admin'}
              </span>
            </div>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}
