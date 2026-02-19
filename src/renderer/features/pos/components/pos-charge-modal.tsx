import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Select,
  SelectItem,
} from '@heroui/react'
import type { POSFormInput } from './pos-interface'

type Props = {
  total: number
  onSubmit: () => void
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onOpenChange: (v: boolean) => void
  onOpenDiscount?: () => void
  onOpenNotes?: () => void
  hasDiscount?: boolean
  hasNotes?: boolean
}

export const PosChargeModal = ({
  total,
  onSubmit,
  isOpen,
  onOpen,
  onOpenChange,
  onOpenDiscount,
  onOpenNotes,
}: Props) => {
  const { control, watch } = useFormContext<POSFormInput>()

  const {
    fields: paymentFields,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({
    control: control,
    name: 'payments',
  })

  const payments = watch('payments')

  const remaining = Math.max(
    0,
    total -
      payments
        .filter(p => p.method !== 'cash')
        .reduce((sum, p) => sum + toCents(Number(p.amount || 0)), 0)
  )

  const totalCash = payments
    .filter(p => p.method === 'cash')
    .reduce((sum, p) => sum + toCents(Number(p.amount || 0)), 0)

  const totalChange = totalCash - remaining

  return (
    <>
      <div className="grid gap-3 grid-cols-2">
        <Button
          variant="flat"
          startContent={
            <IconSolarTicketSaleLinear className="text-default-500 size-5" />
          }
          size="sm"
          onPress={onOpenDiscount}
        >
          Descuento
        </Button>
        <Button
          variant="flat"
          size="sm"
          onPress={onOpenNotes}
          startContent={
            <IconSolarDocumentTextLinear className="text-default-500 size-5" />
          }
        >
          Nota
        </Button>
      </div>

      <Button
        fullWidth
        color="primary"
        variant="shadow"
        onPress={onOpen}
        disabled={total === 0}
      >
        Cobrar
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader>Cobrar Venta</ModalHeader>
              <Form
                onSubmit={onSubmit}
                className="w-full h-full overflow-y-auto"
              >
                <ModalBody className="w-full">
                  <div className="bg-default-50 p-4 text-center rounded-large space-y-1 w-full">
                    <p className="text-default-500 text-small">
                      Total a Cobrar
                    </p>
                    <b className="text-3xl">
                      {formatCurrency(fromCents(total))}
                    </b>
                  </div>

                  {paymentFields.map((field, index) => (
                    <div className="flex gap-3 items-start" key={field.id}>
                      <Controller
                        control={control}
                        name={`payments.${index}.method`}
                        render={({ field }) => (
                          <Select
                            defaultSelectedKeys={[field.value]}
                            onSelectionChange={key => {
                              field.onChange(key.currentKey)
                            }}
                            selectedKeys={[field.value]}
                          >
                            <SelectItem key="cash">Efectivo</SelectItem>
                            <SelectItem key="credit">Crédito</SelectItem>
                          </Select>
                        )}
                      />

                      <Controller
                        control={control}
                        name={`payments.${index}.amount`}
                        render={({ field, fieldState }) => (
                          <NumberInput
                            autoFocus
                            placeholder="0.00"
                            errorMessage={fieldState.error?.message}
                            isInvalid={!!fieldState.error}
                            value={field.value ? Number(field.value) : 0}
                            onChange={e => {
                              const value =
                                typeof e === 'number'
                                  ? ''
                                  : Number(
                                      e.target.value.replace(/[^0-9.]/g, '')
                                    )

                              if (Number.isNaN(value)) {
                                field.onChange('')
                                return
                              }

                              field.onChange(value || '')
                            }}
                            onValueChange={value => {
                              field.onChange(value)
                            }}
                            startContent={
                              <span className="text-default-500 text-sm">
                                L
                              </span>
                            }
                          />
                        )}
                      />

                      <Button
                        isIconOnly
                        color="danger"
                        variant="light"
                        onPress={() => removePayment(index)}
                      >
                        <IconSolarTrashBinMinimalisticLineDuotone className="size-5" />
                      </Button>
                    </div>
                  ))}

                  <div className="w-full">
                    <Button
                      fullWidth
                      variant="light"
                      className="border-2 border-dashed border-default-200 text-default-500"
                      onPress={() => {
                        const hasCashPayment = payments.some(
                          p => p.method === 'cash'
                        )

                        appendPayment({
                          method: hasCashPayment ? 'credit' : 'cash',
                          amount: undefined,
                        })
                      }}
                      startContent={
                        <IconSolarAddCircleLineDuotone className="size-5" />
                      }
                    >
                      Agregar Pago
                    </Button>
                  </div>

                  {totalChange > 0 && (
                    <div className="bg-success-50 p-4 text-center rounded-large space-y-1 w-full">
                      <p className="text-default-500 text-small">Cambio</p>
                      <b className="text-xl text-success-600">
                        {formatCurrency(fromCents(totalChange))}
                      </b>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter className="w-full">
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button color="primary" variant="shadow" type="submit">
                    Finalizar Venta
                  </Button>
                </ModalFooter>
              </Form>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
