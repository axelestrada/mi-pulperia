import { PlusIcon } from "lucide-react";

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
    </div>
  );
};
