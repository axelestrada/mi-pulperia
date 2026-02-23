import { Card, CardBody, CardFooter, Chip, Image } from '@heroui/react'
import type { POSPresentation } from 'main/repositories/pos-repository'

import placeholder from '@/assets/images/placeholder.svg'
import { cn } from '@/lib/utils'

type Props = {
  presentation: POSPresentation
  onClick: (presentation: POSPresentation) => void
  onSelect?: (presentation: POSPresentation) => void
  isActive?: boolean
}

export const PosItem = ({ presentation, onClick, onSelect, isActive }: Props) => {
  const { data: image } = useImagePath(presentation.image)

  const title = presentation.isBase
    ? presentation.productName
    : `${presentation.productName} (${presentation.name})`

  return (
    <Card
      isPressable
      shadow="sm"
      onPress={() => {
        onSelect?.(presentation)
        onClick(presentation)
      }}
      className={cn('h-max min-h-full', {
        'ring-2 ring-primary': isActive,
      })}
      classNames={{
        body: 'flex-none',
      }}
    >
      <CardBody className="overflow-visible p-0">
        <Image
          alt={title}
          className="w-full object-cover aspect-4/3 bg-white"
          radius="lg"
          isBlurred
          src={image ?? placeholder}
          fallbackSrc={placeholder}
          width="100%"
        />
      </CardBody>
      <CardFooter className="text-small text-left flex-col gap-1 items-start h-full flex-1 justify-between">
        <b className="wrap-break-word line-clamp-2 text-ellipsis">{title}</b>
        <div className="flex justify-between items-center w-full">
          <p className="text-default-500">
            {formatLempira(fromCents(presentation.salePrice))}
          </p>
          <Chip size="sm">{presentation.availableQuantity ?? 0}</Chip>
        </div>
      </CardFooter>
    </Card>
  )
}
