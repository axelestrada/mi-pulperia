import type { Selection } from '@heroui/react'
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Input,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react'
import type { Key } from 'react'

const INITIAL_VISIBLE_COLUMNS = ['name', 'status', 'createdAt', 'actions']

const columns = [
  { name: 'ID', uid: 'id' },
  { name: 'NOMBRE', uid: 'name' },
  { name: 'DESCRIPCION', uid: 'description' },
  { name: 'ESTADO', uid: 'status' },
  { name: 'CREADA', uid: 'createdAt' },
  { name: 'ACCIONES', uid: 'actions' },
]

export const CategoriesPage = () => {
  const {
    isOpen: formOpen,
    onOpenChange: onOpenChangeForm,
    onOpen: openForm,
  } = useDisclosure()
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  )

  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(5)
  const [statusFilter, setStatusFilter] = useState<Selection>('all')
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  )

  const { mutateAsync: toggleStatus } = useToggleCategoryStatus()
  const { mutateAsync: deleteCategory } = useDeleteCategory()

  const statusOptions = useMemo(
    () => [
      { name: 'Activas', uid: 'active' },
      { name: 'Inactivas', uid: 'inactive' },
    ],
    []
  )

  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return columns
    return columns.filter(column =>
      Array.from(visibleColumns).includes(column.uid)
    )
  }, [visibleColumns])

  const selectedStatus = useMemo(() => {
    if (statusFilter === 'all') {
      return undefined
    }

    const values = Array.from(statusFilter).map(String) as Array<
      'active' | 'inactive'
    >

    if (values.length === 0 || values.length === statusOptions.length) {
      return undefined
    }

    return values
  }, [statusFilter, statusOptions.length])

  const normalizedSearch = search.trim()

  const { data: categoriesResult, isFetching } = useCategories({
    search: normalizedSearch || undefined,
    status: selectedStatus,
    page: currentPage,
    pageSize,
  })

  const categories = categoriesResult?.data ?? []
  const totalItems = categoriesResult?.pagination?.totalItems ?? 0
  const totalPages = categoriesResult?.pagination?.totalPages ?? 0

  const handleCreate = useCallback(() => {
    setSelectedCategory(null)
    openForm()
  }, [openForm])

  const handleEdit = useCallback(
    (category: Category) => {
      setSelectedCategory(category)
      openForm()
    },
    [openForm]
  )

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const renderCell = useCallback(
    (category: Category, columnKey: Key) => {
      const iconClasses =
        'text-xl text-default-500 pointer-events-none shrink-0'

      switch (columnKey) {
        case 'id':
          return (
            <div className="flex items-center gap-2 text-default-500">
              <span>{category.id}</span>
              <Button
                size="sm"
                variant="light"
                isIconOnly
                className="text-default-500"
                onPress={() => {
                  navigator.clipboard.writeText(String(category.id))
                }}
              >
                <IconSolarCopyLinear />
              </Button>
            </div>
          )
        case 'name':
          return <p className="font-medium">{category.name}</p>
        case 'description':
          return <p>{category.description || null}</p>
        case 'status':
          return (
            <Chip
              className="capitalize border-none bg-default-100 rounded-lg"
              size="sm"
              variant="dot"
              color={category.isActive ? 'success' : 'danger'}
            >
              {category.isActive ? 'Activa' : 'Inactiva'}
            </Chip>
          )
        case 'createdAt':
          return (
            <span className="text-sm text-default-500">
              {new Date(category.createdAt).toLocaleDateString('es-HN')}
            </span>
          )
        case 'actions':
          return (
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <IconSolarMenuDotsLinear className="text-default-500 size-5" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownSection showDivider title="Acciones">
                  <DropdownItem
                    key="edit"
                    onPress={() => handleEdit(category)}
                    startContent={
                      <IconSolarPenNewSquareBoldDuotone
                        className={iconClasses}
                      />
                    }
                  >
                    Actualizar
                  </DropdownItem>
                  <DropdownItem
                    key="toggle"
                    onPress={() =>
                      toggleStatus({
                        id: category.id,
                        isActive: !category.isActive,
                      })
                    }
                    startContent={
                      category.isActive ? (
                        <IconSolarCloseCircleBoldDuotone
                          className={iconClasses}
                        />
                      ) : (
                        <IconSolarCheckCircleBoldDuotone
                          className={iconClasses}
                        />
                      )
                    }
                  >
                    {category.isActive ? 'Desactivar' : 'Activar'}
                  </DropdownItem>
                </DropdownSection>
                <DropdownSection title="Zona de Peligro">
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    description="Esto no se puede deshacer"
                    startContent={
                      <IconSolarTrashBinMinimalisticBoldDuotone
                        className={iconClasses}
                      />
                    }
                    onPress={() => deleteCategory(category.id)}
                  >
                    Eliminar
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          )
        default:
          return ''
      }
    },
    [deleteCategory, handleEdit, toggleStatus]
  )

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 items-center">
          <Input
            isClearable
            className="w-full sm:max-w-72"
            placeholder="Buscar por nombre o descripcion..."
            startContent={
              <IconSolarMagniferOutline className="text-default-400" />
            }
            value={search}
            onValueChange={value => {
              setSearch(value)
              setCurrentPage(1)
            }}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  startContent={
                    <IconSolarTuning2Linear className="text-default-400" />
                  }
                  variant="flat"
                >
                  Filtros
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filtros de estado"
                closeOnSelect={false}
                disallowEmptySelection={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={keys => {
                  setStatusFilter(keys)
                  setCurrentPage(1)
                }}
              >
                {statusOptions.map(status => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {status.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  startContent={
                    <IconSolarSortHorizontalLinear className="text-default-400" />
                  }
                  variant="flat"
                >
                  Columnas
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Columnas de tabla"
                closeOnSelect={false}
                disallowEmptySelection
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map(column => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            {`Total ${totalItems} categorias`}
          </span>
          <Select
            label="Elementos por pagina"
            labelPlacement="outside-left"
            className="sm:max-w-56"
            selectedKeys={[String(pageSize)]}
            classNames={{
              label: 'text-default-400',
            }}
            onSelectionChange={key => {
              const size = Number(key.currentKey ?? pageSize)
              setPageSize(size)
              setCurrentPage(1)
            }}
          >
            <SelectItem key="5">5</SelectItem>
            <SelectItem key="10">10</SelectItem>
            <SelectItem key="15">15</SelectItem>
            <SelectItem key="20">20</SelectItem>
          </Select>
        </div>
      </div>
    )
  }, [
    pageSize,
    search,
    statusFilter,
    statusOptions,
    totalItems,
    visibleColumns,
  ])

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Categorias</h1>
          <p className="text-default-500">Organice sus categorias aqui.</p>
        </div>
        <Button
          color="primary"
          onPress={handleCreate}
          startContent={<IconLucidePlus className="size-4" />}
        >
          Nueva Categoria
        </Button>
      </div>

      <Table
        isHeaderSticky
        topContent={topContent}
        topContentPlacement="outside"
        bottomContent={
          <TablePagination
            total={Math.max(totalPages, 1)}
            page={currentPage}
            onChange={setCurrentPage}
            isDisabled={totalPages <= 1}
          />
        }
        bottomContentPlacement="outside"
        classNames={{
          wrapper: 'max-h-[520px]',
        }}
        selectionMode="none"
      >
        <TableHeader columns={headerColumns}>
          {column => (
            <TableColumn
              key={column.uid}
              align={column.uid === 'actions' ? 'center' : 'start'}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          loadingContent={<Spinner />}
          loadingState={isFetching ? 'loading' : 'idle'}
          emptyContent={'No hay categorias'}
          items={categories}
        >
          {item => (
            <TableRow className="hover:bg-default-100" key={item.id}>
              {columnKey => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={onOpenChangeForm}
        category={selectedCategory}
      />
    </>
  )
}

