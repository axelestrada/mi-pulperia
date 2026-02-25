import { TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const CategoriesTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Nombre</TableHead>
        <TableHead>Descripción</TableHead>
        <TableHead>Estado</TableHead>
        <TableHead></TableHead>
      </TableRow>
    </TableHeader>
  )
}
