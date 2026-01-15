import type { UseFieldArrayReturn } from 'react-hook-form'

type Props = {
  fieldArray: UseFieldArrayReturn<InventoryEntryFormInput, 'items'>
}

export const InventoryEntryFormFields = ({ fieldArray }: Props) => {
  return (
    <div className="space-y-4">
      {fieldArray.fields.map((field, index) => (
        <InventoryEntryFormRow
          key={field.id}
          index={index}
          onRemove={() => fieldArray.remove(index)}
        />
      ))}
    </div>
  )
}
