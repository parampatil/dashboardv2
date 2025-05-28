// app/dashboard/rewards/create-reward/page.tsx
"use client";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { CreateRewardResponse } from "@/types/grpc";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const rewardSchema = z.object({
  rewardName: z.string().min(1, "Name is required"),
  rewardDescription: z.string().min(1, "Description is required"),
  amount: z.number().min(1, "Amount must be positive"),
  currency: z.string().min(1, "Currency is required"),
  rate: z.number().min(0.01, "Rate must be positive"),
});

export default function CreateRewardPage() {
  const { toast } = useToast();
  const api = useApi();
  const form = useForm<z.infer<typeof rewardSchema>>({
    resolver: zodResolver(rewardSchema),
    defaultValues: {
      rewardName: "",
      rewardDescription: "",
      amount: 0,
      currency: "USD",
      rate: 1.0,
    },
  });

  const onSubmit = async (values: z.infer<typeof rewardSchema>) => {
    try {
      const response = await api.fetch("/api/grpc/rewards/create-reward", {
        method: "POST",
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as CreateRewardResponse;

      if (data?.rewardId) {
        toast({
          title: "Success",
          description: `Reward created successfully (ID: ${data.rewardId})`,
          variant: "success",
        });
        form.reset();
      }
    } catch (error: unknown) {
    toast({
      variant: "destructive",
      title: "Error",
      description: `Failed to create reward: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
    });
    console.error("Create reward error:", error);
    }
  };

  return (
    <ProtectedRoute allowedRoutes={["/dashboard/rewards/create-reward"]}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 bg-white rounded-lg shadow-sm"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create New Reward</h1>
          <Button variant="outline" asChild>
            <Link href="/dashboard/rewards/available-rewards">
              View Available Rewards
            </Link>
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="rewardName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reward Name</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., 100 Mins Reward" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rewardDescription"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="E.g., 100 Mins Reward"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <span className="text-sm text-muted-foreground">MIN</span>
                    </div>
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
                      <Input placeholder="USD" {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="1.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <span className="text-sm text-muted-foreground">USD</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Reset Form
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Reward"}
              </Button>
            </div>
          </form>
        </Form>
      </motion.div>
    </ProtectedRoute>
  );
}
