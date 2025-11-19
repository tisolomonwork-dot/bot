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
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

      if (result.retCode === 0) {
        toast({
          title: "Order Placed Successfully",
          description: `Your ${data.side} order for ${data.qty} BTCUSDT has been placed.`,
        });
        form.reset();
      } else {
        throw new Error(result.retMsg || "Failed to place order");
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
    <Card className="bg-card/70 backdrop-blur-sm bg-gradient-to-br from-background to-primary/5">
      <CardHeader>
        <CardTitle>Trade</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="side"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Tabs
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-2"
                    >
                      <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="Buy" className="data-[state=active]:bg-positive/80 data-[state=active]:text-primary-foreground">Long</TabsTrigger>
                        <TabsTrigger value="Sell" className="data-[state=active]:bg-negative/80 data-[state=active]:text-primary-foreground">Short</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
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
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="takeProfit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Take Profit</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 70000" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stopLoss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stop Loss</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 65000" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <Button
              type="submit"
              size="lg"
              className={cn(
                "w-full text-lg font-semibold",
                side === "Buy" ? "bg-positive hover:bg-positive/90 text-background" : "bg-negative hover:bg-negative/90 text-background"
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
