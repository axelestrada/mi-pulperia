import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '../../../components/ui/form'
import {
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog'
import { Checkbox } from '../../../components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'

import {
  CashRegister,
  useCreateCashRegister,
  useUpdateCashRegister,
} from '../../../hooks/use-cash-registers'

const cashRegisterSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  location: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  isDefault: z.boolean().default(false),
})

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
  const isEditing = !!cashRegister

  const createMutation = useCreateCashRegister()
  const updateMutation = useUpdateCashRegister()

  const form = useForm<CashRegisterFormData>({
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
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Editar Caja Registradora' : 'Nueva Caja Registradora'}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? 'Modifique los detalles de la caja registradora.'
            : 'Complete los datos para crear una nueva caja.'}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ej. Caja Principal" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación (Opcional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ej. Entrada Principal" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isEditing && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="inactive">Inactiva</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Caja Predeterminada</FormLabel>
                  <FormDescription>
                    Esta caja será seleccionada por defecto al abrir sesión.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  )
}
