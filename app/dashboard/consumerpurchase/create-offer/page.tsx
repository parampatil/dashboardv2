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
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const result = await response.json();
      toast({
        title: "Offer Created",
        description: `Offer created with ID: ${result.offerId}`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to create offer. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute allowedRoutes={['/dashboard/consumerpurchase/create-offer']}>
      <motion.div
        className="space-y-6 max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Offer</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter currency" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numberOfMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Minutes</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter number of minutes" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="offerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter offer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter total price" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Create Offer</Button>
            </form>
          </Form>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default CreateOffer;
