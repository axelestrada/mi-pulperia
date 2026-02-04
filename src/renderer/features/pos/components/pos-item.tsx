import { CardBody, Card, Image, CardFooter, Chip } from '@heroui/react'
import { POSPresentation } from 'main/repositories/pos-repository'

import placeholder from '@/assets/images/placeholder.svg'

type Props = {
  presentation: POSPresentation
  onClick: (presentation: POSPresentation) => void
}

export const PosItem = ({ presentation, onClick }: Props) => {
  const { data: image } = useImagePath(presentation.image)

  const title = presentation.isBase
    ? presentation.productName
    : `${presentation.productName} (${presentation.name})`

  return (
    <Card isPressable shadow="sm" onPress={() => onClick(presentation)}>
      <CardBody className="overflow-visible p-0">
        <Image
          alt={title}
          className="w-full object-cover aspect-4/3 bg-white"
          radius="lg"
          isBlurred
          src={image ?? placeholder}
          width="100%"
        />
      </CardBody>
      <CardFooter className="text-small text-left flex-col gap-1 items-start h-full justify-between">
        <b>{title}</b>
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
