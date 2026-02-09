import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Select,
  SelectItem,
  NumberInput,
} from '@heroui/react'
import { POSFormInput } from './pos-interface'

type Props = {
  total: number
  onSubmit: (callback: () => void) => void
}

export const PosChargeModal = ({ total, onSubmit }: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

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
              <ModalBody>
                <div className="bg-default-50 p-4 text-center rounded-large space-y-1">
                  <p className="text-default-500 text-small">Total a Cobrar</p>
                  <b className="text-3xl">{formatCurrency(fromCents(total))}</b>
                </div>

                {paymentFields.map((field, index) => (
                  <div className="flex gap-3" key={field.id}>
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
                      render={({ field }) => (
                        <NumberInput
                          placeholder="0.00"
                          step={10}
                          value={field.value ? Number(field.value) : undefined}
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
                  <div className="bg-success-50 p-4 text-center rounded-large space-y-1">
                    <p className="text-default-500 text-small">Cambio</p>
                    <b className="text-xl text-success-600">
                      {formatCurrency(fromCents(totalChange))}
                    </b>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    onSubmit(onClose)
                  }}
                  variant="shadow"
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
