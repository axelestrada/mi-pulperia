import { CustomersTable } from "@/features/customers/components/customers-table";
import { PlusIcon } from "lucide-react";

export const CustomersPage = () => {
  return (
    <div>
      <PageHeader
        title="Gestión de Clientes"
        description="Administra clientes y sistema de créditos."
        actions={
          <Button onClick={() => console.log("Nuevo cliente")}>
            <PlusIcon /> Nuevo Cliente
          </Button>
        }
      />

      <Tabs defaultValue="customers">
        <TabsList className="mb-2">
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="credits">Libro de Créditos</TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <CustomersTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};
