import { Pie, PieChart, Sector } from "recharts";
import { type PieSectorDataItem } from "recharts/types/polar/Pie";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartData = [
  { category: "bebidas", sales: 1250, fill: "var(--color-bebidas)" },
  { category: "abarrotes", sales: 980, fill: "var(--color-abarrotes)" },
  { category: "snacks", sales: 620, fill: "var(--color-snacks)" },
  { category: "limpieza", sales: 310, fill: "var(--color-limpieza)" },
  { category: "otros", sales: 140, fill: "var(--color-otros)" },
];

const chartConfig = {
  sales: {
    label: "Ventas",
  },
  bebidas: {
    label: "Bebidas",
    color: "var(--chart-1)",
  },
  abarrotes: {
    label: "Abarrotes",
    color: "var(--chart-2)",
  },
  snacks: {
    label: "Snacks",
    color: "var(--chart-3)",
  },
  limpieza: {
    label: "Limpieza",
    color: "var(--chart-4)",
  },
  otros: {
    label: "Otros",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export const CategorySales = () => {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="sales"
          nameKey="category"
          innerRadius={50}
          strokeWidth={5}
          activeIndex={0}
          activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
            <Sector {...props} outerRadius={outerRadius + 10} />
          )}
        />

        <ChartLegend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  );
};
