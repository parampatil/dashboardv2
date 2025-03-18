import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { Reward, CreateRewardTransactionRequest } from "@/types/grpc";

const formSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  rewardId: z.string().min(1, "Reward ID is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface RewardFormProps {
  initialRewardId?: string;
  onClose?: () => void;
}

export function RewardForm({ initialRewardId, onClose }: RewardFormProps) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const api = useApi();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      rewardId: initialRewardId || "",
    },
  });

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await api.fetch("/api/grpc/rewards/available");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error.details || data.error.errorMessage);
        }
        setRewards(data.rewards || []);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch available rewards",
          description: (error as Error).message,
        });
      }
    };

    fetchRewards();
  }, []);

  const onSubmit = async (data: FormValues) => {
    const payload: CreateRewardTransactionRequest = {
      userId: parseInt(data.userId, 10),
      rewardId: parseInt(data.rewardId, 10),
    };

    try {
      const response = await api.fetch('/api/grpc/rewards/give-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error.details || result.error.errorMessage);
      }
      
      toast({
        title: "Reward Given",
        description: `Reward transaction created with ID: ${result.rewardTransactionId}`,
        variant: "success",
      });
      if (onClose) onClose();
    } catch (error) {
      toast({
        title: "Failed to give reward. Please try again.",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter user ID" {...field} />
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
              <FormLabel>Reward</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reward" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rewards.map((reward) => (
                    <SelectItem key={reward.rewardId} value={reward.rewardId.toString()}>
                      {reward.rewardName} - {reward.amount} Min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Give Reward</Button>
      </form>
    </Form>
  );
}
