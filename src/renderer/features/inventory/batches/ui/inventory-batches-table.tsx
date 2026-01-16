type Props = {
  filters: InventoryBatchFilters
}

export const InventoryBatchesTable = ({ filters }: Props) => {
  const { data, isLoading } = useInventoryBatches(filters)

  if (!isLoading && (!data || data.length === 0)) {
    return <InventoryBatchesTableEmpty />
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <Table>
        <InventoryBatchesTableHeader />

        <TableBody>
          {data?.map(batch => (
            <InventoryBatchesTableRow key={batch.id} batch={batch} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
