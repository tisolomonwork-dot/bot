"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { chartData } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "../ui/badge";

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--chart-1))",
  },
};

export function DetailedChart() {
  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>BTC/USD</CardTitle>
                <CardDescription>
                    <span className="text-3xl font-bold mr-2">$67,700.50</span>
                    <span className="text-sm text-positive font-medium">+2.1%</span>
                </CardDescription>
            </div>
            <Tabs defaultValue="1h">
                <TabsList>
                    <TabsTrigger value="1m">1m</TabsTrigger>
                    <TabsTrigger value="15m">15m</TabsTrigger>
                    <TabsTrigger value="1h">1h</TabsTrigger>
                    <TabsTrigger value="4h">4h</TabsTrigger>
                    <TabsTrigger value="1d">1d</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 0,
              right: 12,
              top: 10,
              bottom: 0
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} orientation="right" tickFormatter={(value) => `$${value/1000}k`} />
            <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="line" labelFormatter={(label, payload) => new Date(label).toLocaleString()} />} />
            <defs>
              <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="close"
              type="natural"
              fill="url(#fillPrice)"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              stackId="a"
              dot={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
