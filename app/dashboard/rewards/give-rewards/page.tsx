"use client";
import React from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { CreateRewardTransactionRequest } from "@/types/grpc";

const formSchema = z.object({
  userId: z.number().int().positive("User ID must be a positive integer"),
  rewardId: z.number().int().positive("Reward ID must be a positive integer"),
});

const GiveReward = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: 0,
      rewardId: 0,
    },
  });

  const onSubmit = async (data: CreateRewardTransactionRequest) => {
    try {
      const response = await fetch('/api/grpc/rewards/CreateRewardTransactionRequestWithClient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const result = await response.json();
      toast({
        title: "Reward Given",
        description: `Reward transaction created with ID: ${result.rewardTransactionId}`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to give reward. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute allowedRoutes={["/dashboard/rewards/give-rewards"]}>
      <motion.div
        className="space-y-6 max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Give Reward</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter user ID" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rewardId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reward ID</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter reward ID" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Give Reward</Button>
            </form>
          </Form>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default GiveReward;
