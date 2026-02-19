import { Button, Image, NumberInput, Tooltip } from '@heroui/react'

import placeholder from '@/assets/images/placeholder.svg'
import { cn } from '@/lib/utils'

type Props = {
  title: string
  image?: string | null
  quantity: number
  itemTotal: number
  unitPrice: number
  discount?: string
  notes?: string
  onQuantityChange: (quantity: number) => void
  onEditDiscount: () => void
  onEditNotes: () => void
  onRemove: () => void
}

export const PosCartItem = ({
  title,
  image,
  quantity,
  unitPrice,
  itemTotal,
  discount,
  notes,
  onQuantityChange,
  onEditDiscount,
  onEditNotes,
  onRemove,
}: Props) => {
  const { data: imagePath } = useImagePath(image)
  return (
    <div className="group relative rounded-medium p-1 overflow-hidden hover:bg-default-50 transition-colors">
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
              <div className="flex gap-2">
                <NumberInput
                  className="sm:max-w-14"
                  size="sm"
                  variant="bordered"
                  value={quantity}
                  onValueChange={onQuantityChange}
                />

                <div className="flex items-center gap-1">
                  <Tooltip
                    content={notes ? 'Editar notas' : 'Agregar notas'}
                    size="sm"
                    color="foreground"
                  >
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onPress={onEditNotes}
                      className={cn(
                        'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                        {
                          'opacity-100': !!notes,
                        }
                      )}
                    >
                      <IconSolarPenLinear className="size-4 text-default-500" />
                    </Button>
                  </Tooltip>

                  <Tooltip
                    content={
                      discount ? 'Editar descuento' : 'Agregar descuento'
                    }
                    size="sm"
                    color="foreground"
                  >
                    <Button
                      isIconOnly={!discount}
                      variant="light"
                      size="sm"
                      onPress={onEditDiscount}
                      className={cn(
                        'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                        {
                          'opacity-100': !!discount,
                        }
                      )}
                    >
                      <IconSolarTicketSaleLinear className="size-5 text-default-500" />
                      {discount && (
                        <span className="text-default-500">{discount}</span>
                      )}
                    </Button>
                  </Tooltip>
                </div>
              </div>

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

