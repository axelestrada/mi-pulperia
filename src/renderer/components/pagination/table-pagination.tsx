export const TablePagination = () => {
  return (
    <div className="flex items-center justify-end gap-10">
      <Field orientation="horizontal" className="w-fit">
        <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
        <Select defaultValue="10">
          <SelectTrigger className="w-20" id="select-rows-per-page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <p className="text-sm">Página 1 de 1</p>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon-sm">
          <IconLucideChevronsLeft />
        </Button>
        <Button variant="outline" size="icon-sm">
          <IconLucideChevronLeft />
        </Button>
        <Button variant="outline" size="icon-sm">
          <IconLucideChevronRight />
        </Button>
        <Button variant="outline" size="icon-sm">
          <IconLucideChevronsRight />
        </Button>
      </div>
    </div>
  )
}
