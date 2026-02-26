import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Checkbox,
  Input,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from '@heroui/react'
import type React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  type CashRegister,
  useCreateCashRegister,
  useUpdateCashRegister,
} from '../../../hooks/use-cash-registers'

const cashRegisterSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  location: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  isDefault: z.boolean().default(false),
})

type CashRegisterFormInput = z.input<typeof cashRegisterSchema>
type CashRegisterFormData = z.infer<typeof cashRegisterSchema>

interface CashRegisterFormProps {
  cashRegister?: CashRegister
  onSuccess?: () => void
  onCancel?: () => void
}

export const CashRegisterForm: React.FC<CashRegisterFormProps> = ({
  cashRegister,
  onSuccess,
  onCancel,
}) => {
  const isEditing = Boolean(cashRegister)
  const createMutation = useCreateCashRegister()
  const updateMutation = useUpdateCashRegister()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CashRegisterFormInput, unknown, CashRegisterFormData>({
    resolver: zodResolver(cashRegisterSchema),
    defaultValues: {
      name: cashRegister?.name || '',
      location: cashRegister?.location || '',
      status: cashRegister?.status || 'active',
      isDefault: cashRegister?.isDefault || false,
    },
  })

  const onSubmit = async (data: CashRegisterFormData) => {
    try {
      if (isEditing && cashRegister) {
        await updateMutation.mutateAsync({
          id: cashRegister.id,
          input: data,
        })
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          location: data.location || undefined,
          isDefault: data.isDefault,
        })
      }

      onSuccess?.()
    } catch (error) {
      console.error('Error saving cash register:', error)
      sileo.error({
        title: 'No se pudo guardar la caja',
        description: 'Verifique los datos e intente nuevamente.',
      })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ModalHeader className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">
          {isEditing ? 'Editar Caja Registradora' : 'Nueva Caja Registradora'}
        </h3>
        <p className="text-sm text-default-500">
          {isEditing
            ? 'Modifique los detalles de la caja registradora.'
            : 'Complete los datos para crear una nueva caja.'}
        </p>
      </ModalHeader>

      <ModalBody className="space-y-4">
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              {...field}
              label="Nombre *"
              placeholder="Ej. Caja Principal"
              isInvalid={Boolean(errors.name?.message)}
              errorMessage={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="location"
          render={({ field }) => (
            <Input
              {...field}
              value={field.value || ''}
              label="Ubicacion"
              placeholder="Ej. Entrada principal"
              isInvalid={Boolean(errors.location?.message)}
              errorMessage={errors.location?.message}
            />
          )}
        />

        {isEditing && (
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                label="Estado"
                selectedKeys={field.value ? [field.value] : []}
                defaultSelectedKeys={field.value ? [field.value] : undefined}
                onSelectionChange={keys => {
                  const next = String(keys.currentKey || 'active') as
                    | 'active'
                    | 'inactive'
                  field.onChange(next)
                }}
                isInvalid={Boolean(errors.status?.message)}
                errorMessage={errors.status?.message}
              >
                <SelectItem key="active">Activa</SelectItem>
                <SelectItem key="inactive">Inactiva</SelectItem>
              </Select>
            )}
          />
        )}

        <Controller
          control={control}
          name="isDefault"
          render={({ field }) => (
            <Checkbox isSelected={field.value} onValueChange={field.onChange}>
              Caja predeterminada para aperturas de sesion
            </Checkbox>
          )}
        />
      </ModalBody>

      <ModalFooter>
        <Button
          type="button"
          variant="light"
          onPress={onCancel}
          isDisabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" color="primary" isLoading={isPending}>
          {isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </ModalFooter>
    </form>
  )
}

