import { Button, NumberInput, Image } from '@heroui/react'

import placeholder from '@/assets/images/placeholder.svg'

type Props = {
  title: string
  image?: string | null
  quantity: number
  itemTotal: number
  unitPrice: number
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

export const PosCartItem = ({
  title,
  image,
  quantity,
  unitPrice,
  itemTotal,
  onQuantityChange,
  onRemove,
}: Props) => {
  const { data: imagePath } = useImagePath(image)
  return (
    <div>
      <div className="flex gap-3 items-center">
        <Image
          isBlurred
          className="aspect-4/3 w-14 object-cover bg-white"
          src={imagePath || placeholder}
          fallbackSrc={placeholder}
          alt={title}
        />

        <div className="flex-1 flex">
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <b className="text-small mt-auto">{title}</b>

              <Button
                isIconOnly
                variant="light"
                color="danger"
                size="sm"
                onPress={onRemove}
              >
                <IconSolarTrashBinMinimalisticLineDuotone className="size-5" />
              </Button>
            </div>

            <div className="flex justify-between items-end">
              <NumberInput
                className="sm:max-w-14"
                size="sm"
                variant="bordered"
                value={quantity}
                onValueChange={onQuantityChange}
              />

              <div className="flex-col flex items-end text-small">
                <b className="text-default-500">
                  {`${formatLempira(fromCents(itemTotal))}`}
                </b>
                <p className="text-default-500 text-xs">
                  {`${formatLempira(fromCents(unitPrice))} c/u`}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between items-end"></div>
        </div>
      </div>
    </div>
  )
}
