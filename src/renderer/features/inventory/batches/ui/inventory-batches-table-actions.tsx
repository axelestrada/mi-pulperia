type Props = {
  batch: InventoryBatch
}

export const InventoryBatchesTableActions = ({ batch }: Props) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        console.log(batch.id)
      }}
    >
      <IconLucideEye className="size-4" />
    </Button>
  )
}