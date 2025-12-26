import { PlusIcon } from "lucide-react";

export const ProductsHeader = () => {
  return (
    <PageHeader
      title="Productos"
      description="Gestione sus productos aquí."
      actions={
        <Button onClick={() => console.log("Nuevo producto")}>
          <PlusIcon /> Nuevo Producto
        </Button>
      }
    />
  );
};
