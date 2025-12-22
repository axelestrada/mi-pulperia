import { formatCurrency } from "@/shared/utils/formatCurrency";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

interface Props {
  timeRange: string;
}

const topProductsData = [
  {
    name: "Coca-Cola 600ml",
    sales: 124,
    revenue: 1860,
    margin: 25,
    trend: "up",
  },
  {
    name: "Taqueritos Verdes",
    sales: 98,
    revenue: 980,
    margin: 30,
    trend: "up",
  },
  {
    name: "Pan Bimbo Blanco",
    sales: 85,
    revenue: 1275,
    margin: 20,
    trend: "down",
  },
  {
    name: "Detergente Ace 1kg",
    sales: 67,
    revenue: 2250,
    margin: 35,
    trend: "up",
  },
  {
    name: "Huevos (Docena)",
    sales: 45,
    revenue: 2010,
    margin: 15,
    trend: "up",
  },
];

export const TopProducts = ({ timeRange }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos Más Vendidos</CardTitle>
        <CardDescription>
          Top 5 productos con mayores ventas en los últimos {timeRange} días
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {topProductsData.map((product, index) => (
            <div
              className="flex items-center justify-between border p-3 rounded-lg"
              key={product.name}
            >
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    <span className="font-bold text-primary">{`#${
                      index + 1
                    }`}</span>
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.sales} unidades • Margen {product.margin}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {formatCurrency(product.revenue)}
                  </Badge>
                  {product.trend === "up" ? (
                    <TrendingUpIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDownIcon className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
