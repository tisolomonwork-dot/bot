"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { placeOrder } from "@/lib/services/bybit-service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const tradeSchema = z.object({
  side: z.enum(["Buy", "Sell"]),
  qty: z.coerce.number().positive("Quantity must be positive"),
  stopLoss: z.coerce.number().optional(),
  takeProfit: z.coerce.number().optional(),
});

type TradeFormValues = z.infer<typeof tradeSchema>;

export function TradePanel() {
  const { toast } = useToast();
  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      side: "Buy",
      qty: 0.001,
    },
  });

  const onSubmit: SubmitHandler<TradeFormValues> = async (data) => {
    try {
      const result = await placeOrder({
        symbol: "BTCUSDT",
        ...data,
      });

      if (result.success) {
        toast({
          title: "Order Placed Successfully",
          description: `Your ${data.side} order for ${data.qty} BTCUSDT has been placed.`,
        });
        form.reset();
      } else {
        throw new Error("Failed to place order");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Order Failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  const side = form.watch("side");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade BTC/USDT</CardTitle>
        <CardDescription>Place your market orders below.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="side"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Side</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a side" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Buy">Long (Buy)</SelectItem>
                      <SelectItem value="Sell">Short (Sell)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="qty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lot Size (BTC)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="takeProfit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Take Profit (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 70000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stopLoss"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stop Loss (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 65000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className={cn(
                "w-full",
                side === "Buy" ? "bg-positive hover:bg-positive/90" : "bg-negative hover:bg-negative/90"
              )}
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Placing Order..."
                : `${side === "Buy" ? "Go Long" : "Go Short"} BTC`}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
