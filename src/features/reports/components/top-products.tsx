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
    sales: 45,
    revenue: 2250,
    margin: 35,
    trend: "up",
  },
  {
    name: "Huevos (Docena)",
    sales: 67,
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

      <CardContent></CardContent>
    </Card>
  );
};
