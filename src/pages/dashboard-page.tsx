import { DollarSignIcon, PlusIcon, ShoppingCartIcon, TrendingUpIcon } from "lucide-react";

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

      <div className="grid grid-cols-2 gap-4">
        <Card className="@container/card gap-3">
          <CardHeader>
            <CardTitle className="text-sm">Ventas de hoy</CardTitle>

            <CardAction>
              <DollarSignIcon className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>

          <CardContent>
            <CardTitle className="text-2xl mb-2 font-semibold tabular-nums @[250px]/card:text-3xl">
              L. 1,450.00
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <TrendingUpIcon className="size-4 text-green-600" />
              +12% desde ayer
            </CardDescription>
          </CardContent>
          <CardFooter className="flex flex-col gap-1">
            <CardDescription className="flex justify-between w-full text-xs">
              Margen
              <span>25%</span>
            </CardDescription>
            <Progress value={33} color="bg-cyan-600" className="h-1" />
          </CardFooter>
        </Card>

        <Card className="@container/card gap-3">
          <CardHeader>
            <CardTitle className="text-sm">Transacciones</CardTitle>

            <CardAction>
              <ShoppingCartIcon className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>

          <CardContent>
            <CardTitle className="text-2xl mb-2 font-semibold tabular-nums @[250px]/card:text-3xl">
              45
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <TrendingUpIcon className="size-4 text-green-600" />
              +12% desde ayer
            </CardDescription>
          </CardContent>
          <CardFooter className="flex flex-col gap-1">
            <CardDescription className="flex justify-between w-full text-xs">
              Margen
              <span>25%</span>
            </CardDescription>
            <Progress value={33} color="bg-cyan-600" className="h-1" />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
