import { POSPresentation } from 'main/repositories/pos-repository'

type Props = {
  presentation: POSPresentation
  onClick: (presentation: POSPresentation) => void
}

export const PosItem = ({ presentation, onClick }: Props) => {
  const { data: image } = useImagePath(presentation.image)

  return (
    <div
      className="border rounded-lg cursor-pointer flex flex-col"
      onClick={() => onClick(presentation)}
      key={'pos-presentation-' + presentation.id}
    >
      <SafeImage
        className="aspect-square w-full object-cover rounded-none rounded-t-lg"
        src={image}
        alt={presentation.productName}
      />

      <div className="space-y-1 p-2 flex-1 flex flex-col justify-between">
        <div>
          <p className="font-medium text-sm leading-tight line-clamp-2">
            {presentation.productName} ({presentation.name})
          </p>
          <p className="text-xs text-muted-foreground">{presentation.sku}</p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-bold text-primary">
            {formatLempira(presentation.salePrice / 100)}
          </span>
          <Badge variant="secondary" className="text-xs">
            {presentation.availableQuantity ?? 0}
          </Badge>
        </div>
      </div>
    </div>
  )
}
