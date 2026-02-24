import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { TableCell, TableRow } from '@/components/ui/table'

type Props = {
  category: Category
  onEdit: (category: Category) => void
}

export const CategoriesTableRow = ({ category, onEdit }: Props) => {
  const { mutateAsync: toggleStatus } = useToggleCategoryStatus()
  const { mutateAsync: deleteCategory } = useDeleteCategory()

  const handleToggleStatus = () => {
    toggleStatus({
      id: category.id,
      isActive: !category.isActive,
    })
  }

  return (
    <TableRow>
      <TableCell>
        <p className="font-medium">{category.name}</p>
      </TableCell>

      <TableCell>{category.description ?? '—'}</TableCell>

      <TableCell>
        <Chip className={category.isActive ? 'bg-green-600' : ''}>
          {category.isActive ? 'Activa' : 'Inactiva'}
        </Chip>
      </TableCell>

      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" isIconOnly>
              <IconLucideMoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                onEdit(category)
              }}
            >
              <IconLucideEdit className="size-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleStatus}>
              {category.isActive ? (
                <>
                  <IconLucideX className="mr-2 size-4" />
                  Desactivar
                </>
              ) : (
                <>
                  <IconLucideCheck className="mr-2 size-4" />
                  Activar
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                deleteCategory(category.id)
              }}
              variant="destructive"
            >
              <IconLucideTrash2 className="size-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
