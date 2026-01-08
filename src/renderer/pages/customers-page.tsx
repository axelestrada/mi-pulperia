import { PlusIcon } from 'lucide-react'

export const CustomersPage = () => {
  return (
    <div className="flex-1 flex flex-col">
      <PageHeader
        title="Gestión de Clientes"
        description="Administra clientes y sistema de créditos."
        actions={
          <Button onClick={() => console.log('Nuevo cliente')}>
            <PlusIcon /> Nuevo Cliente
          </Button>
        }
      />

      <Tabs defaultValue="customers" className="flex-1">
        <TabsList className="mb-2">
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="credits">Libro de Créditos</TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <CustomersTable />
        </TabsContent>

        <TabsContent value="credits">
          <ComingSoon />
        </TabsContent>
      </Tabs>
    </div>
  )
}
