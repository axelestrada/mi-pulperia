import { PlusIcon, TrendingUpIcon } from "lucide-react";

export const DashboardPage = () => {
  return (
    <div>
      <PageHeader
        title="Panel Principal"
        description="Resumen del estado de tu pulpería"
        actions={
          <>
            <Select defaultValue="7">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Seleccione un rango" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Rango de tiempo</SelectLabel>
                  <SelectItem value="7">7 días</SelectItem>
                  <SelectItem value="14">14 días</SelectItem>
                  <SelectItem value="30">30 días</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button onClick={() => console.log("Nueva venta")}>
              <PlusIcon /> Nueva Venta
            </Button>
          </>
        }
      />

      <div>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Ventas de hoy</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              L. 1,450.00
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <TrendingUpIcon />
                +12.5%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Trending up this month <TrendingUpIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Visitors for the last 6 months
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
