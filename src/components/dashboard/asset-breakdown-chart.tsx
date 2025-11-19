"use client";

import type { FC } from 'react';
import { Pie, PieChart, Cell, Tooltip } from "recharts";

import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Asset } from "@/lib/types";

interface AssetBreakdownChartProps {
  data: Asset[];
}

const chartConfig = {
  value: {
    label: "Assets",
  },
  btc: {
    label: "BTC",
    color: "hsl(var(--chart-1))",
  },
  eth: {
    label: "ETH",
    color: "hsl(var(--chart-2))",
  },
  sol: {
    label: "SOL",
    color: "hsl(var(--chart-3))",
  },
  usdt: {
    label: "USDT",
    color: "hsl(var(--chart-4))",
  },
  doge: {
    label: "DOGE",
    color: "hsl(var(--chart-5))",
  },
};

export const AssetBreakdownChart: FC<AssetBreakdownChartProps> = ({ data }) => {
  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full max-h-[250px] pb-0">
      <PieChart>
        <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="60%"
          strokeWidth={5}
        >
          {data.map((entry) => (
            <Cell key={entry.id} fill={chartConfig[entry.id as keyof typeof chartConfig]?.color} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
};
