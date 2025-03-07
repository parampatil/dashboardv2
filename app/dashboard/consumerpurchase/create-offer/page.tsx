// app/dashboard/consumerpurchase/create-offer/page.tsx
"use client";
import React from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { CreateOfferRequest } from '@/types/grpc';
import { Tag } from 'lucide-react';

const formSchema = z.object({
  country: z.string().min(2, "Country must be at least 2 characters"),
  currency: z.string().min(3, "Currency must be at least 3 characters"),
  numberOfMinutes: z.number().min(1, "Number of minutes must be at least 1"),
  offerName: z.string().min(3, "Offer name must be at least 3 characters"),
  totalPrice: z.number().min(0, "Total price must be a positive number"),
});

const CreateOffer = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: '',
      currency: '',
      numberOfMinutes: 0,
      offerName: '',
      totalPrice: 0,
    },
  });

  const onSubmit = async (data: CreateOfferRequest) => {
    try {
      const response = await fetch('/api/grpc/consumerpurchasedev/createOffer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error.details || result.error.errorMessage);
      }
      
      toast({
        title: "Offer Created",
        description: `Offer created with ID: ${result.offerId}`,
      });
    } catch (error) {
      toast({
        title: "Failed to create offer. Please try again.",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute allowedRoutes={['/dashboard/consumerpurchase/create-offer']}>
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-white rounded-lg shadow-md p-6 mb-6"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="flex items-center mb-6"
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tag className="h-8 w-8 text-blue-500 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">Create Offer</h1>
          </motion.div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {['country', 'currency', 'numberOfMinutes', 'offerName', 'totalPrice'].map((field, index) => (
                <motion.div
                  key={field}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <FormField
                    control={form.control}
                    name={field as keyof CreateOfferRequest}
                    render={({ field: fieldProps }) => (
                      <FormItem>
                        <FormLabel>{field.charAt(0).toUpperCase() + field.slice(1)}</FormLabel>
                        <FormControl>
                          <Input
                            type={['numberOfMinutes', 'totalPrice'].includes(field) ? 'number' : 'text'}
                            placeholder={`Enter ${field}`}
                            {...fieldProps}
                            onChange={(e) => fieldProps.onChange(['numberOfMinutes', 'totalPrice'].includes(field) ? Number(e.target.value) : e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button type="submit" className="w-full">Create Offer</Button>
              </motion.div>
            </form>
          </Form>
        </motion.div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default CreateOffer;
