import {
  Button,
  Form,
  Modal,
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
}

export const PosChargeModal = ({
  total,
  onSubmit,
  isOpen,
  onOpen,
  onOpenChange,
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

  const formRef = useRef<HTMLFormElement>(null)

  return (
    <>
      <div className="grid gap-3 grid-cols-2">
        <Button
          variant="flat"
          startContent={
            <IconSolarTicketSaleLinear className="text-default-500 size-5" />
          }
          size="sm"
        >
          Descuento
        </Button>
        <Button
          variant="flat"
          size="sm"
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

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Cobrar Venta
              </ModalHeader>
              <Form
                onSubmit={onSubmit}
                ref={formRef}
                className="flex flex-1 flex-col gap-3 px-6 py-2"
              >
                <div className="bg-default-50 p-4 text-center rounded-large space-y-1 w-full">
                  <p className="text-default-500 text-small">Total a Cobrar</p>
                  <b className="text-3xl">{formatCurrency(fromCents(total))}</b>
                </div>

                {paymentFields.map((field, index) => (
                  <div className="flex gap-3 items-start" key={field.id}>
                    <Controller
                      control={control}
                      name={`payments.${index}.method`}
                      render={({ field }) => (
                        <Select
                          defaultSelectedKeys={['cash']}
                          onSelectionChange={key => {
                            field.onChange(key.currentKey)
                          }}
                          value={field.value}
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
                          placeholder="0.00"
                          errorMessage={fieldState.error?.message}
                          isInvalid={!!fieldState.error}
                          value={field.value ? Number(field.value) : undefined}
                          onChange={e => {
                            const value =
                              typeof e === 'number' ? e : Number(e.target.value)

                            if (isNaN(value)) return

                            field.onChange(value || undefined)
                          }}
                          onValueChange={value => {
                            field.onChange(value)
                          }}
                          startContent={
                            <span className="text-default-500">L</span>
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

                <Button
                  fullWidth
                  variant="light"
                  className="border-2 border-dashed border-default-200 text-default-500"
                  onPress={() => {
                    appendPayment({
                      method: 'cash',
                      amount: '',
                    })
                  }}
                >
                  <IconSolarAddCircleLineDuotone className="size-5" />
                  Agregar Pago
                </Button>

                {totalChange > 0 && (
                  <div className="bg-success-50 p-4 text-center rounded-large space-y-1 w-full">
                    <p className="text-default-500 text-small">Cambio</p>
                    <b className="text-xl text-success-600">
                      {formatCurrency(fromCents(totalChange))}
                    </b>
                  </div>
                )}
              </Form>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  variant="shadow"
                  onPress={() => formRef.current?.requestSubmit()}
                >
                  Finalizar Venta
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
