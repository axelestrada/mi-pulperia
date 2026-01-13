import { useMatches } from "react-router-dom"
import { getRouteTitle } from "shared/router/getRouteTitle"

export const Layout = () => {
  const title = getRouteTitle(useMatches()) ?? 'Mi Pulpería'

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />

            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />

            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2 px-4">
            <div className="relative w-72">
              <IconLucideSearch className="size-4 text-foreground/50 absolute left-3 top-1/2 -translate-y-1/2" />

              <Input
                className="w-full pl-10 pr-15"
                placeholder="Buscar productos, clientes..."
              />

              <Kbd className="absolute right-2 top-1/2 -translate-y-1/2">
                <KbdKey>⌘</KbdKey>
                <KbdKey>K</KbdKey>
              </Kbd>
            </div>

            <Separator
              orientation="vertical"
              className="ml-2 data-[orientation=vertical]:h-4"
            />

            <Button size="icon" variant="ghost" className="relative">
              <IconLucideBell />
              <Badge className="h-4 min-w-4 w-max text-[11px] tabular-nums rounded-full px-1 absolute top-0 right-1">
                8
              </Badge>
            </Button>

            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-4"
            />

            <Button size="icon" variant="ghost">
              <IconLucideMoon />
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
