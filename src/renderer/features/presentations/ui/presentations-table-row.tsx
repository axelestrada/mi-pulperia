type Props = {
  presentation: Presentation
  product: Product
}

export const PresentationsTableRow = ({ presentation, product }: Props) => {
  const { data: imagePath } = useImagePath(presentation.image)

  return (
    <TableRow key={presentation.id}>
      <TableCell>
        <SafeImage
          src={imagePath}
          alt={presentation.name}
          className="h-12 w-12 object-cover rounded"
        />
      </TableCell>

      <TableCell>
        <span className="font-medium">{presentation.name}</span>
        {presentation.isBase && (
          <Badge variant="secondary" className="ml-2">
            Base
          </Badge>
        )}
      </TableCell>

      <TableCell className="whitespace-normal">
        {presentation.description ?? '—'}
      </TableCell>

      <TableCell>{presentation.sku ?? '—'}</TableCell>

      <TableCell>{presentation.barcode ?? '—'}</TableCell>

      <TableCell>
        <MeasurementUnitBadge unit={presentation.unit} />
      </TableCell>

      <TableCell>
        {presentation.factorType === 'fixed'
          ? `x${presentation.factor}`
          : 'Variable'}
      </TableCell>

      <TableCell>L {(presentation.salePrice / 100).toFixed(2)}</TableCell>

      <TableCell>
        <StatusBadge active={presentation.isActive} />
      </TableCell>

      <TableCell className="text-right">
        <PresentationsTableActions
          presentation={presentation}
          product={product}
        />
      </TableCell>
    </TableRow>
  )
}
