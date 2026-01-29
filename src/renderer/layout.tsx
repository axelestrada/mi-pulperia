import { Divider, Button, Badge, Input } from '@heroui/react'
import { useMatches } from 'react-router-dom'
import { getRouteTitle } from 'shared/router/getRouteTitle'

export const Layout = () => {
  const title = getRouteTitle(useMatches()) ?? 'Mi Pulpería'

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />

            <Divider orientation="vertical" className='h-5' />

            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    <p className="text-default-500">{title}</p>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2 px-4">
            <Input
              className="sm:max-w-56"
              radius="full"
              startContent={<IconSolarMagniferOutline className="size-5" />}
              placeholder="Buscar..."
            />
            <Button isIconOnly variant="light" radius="full">
              <IconSolarSunOutline className="size-6" />
            </Button>
            <Button isIconOnly variant="light" radius="full">
              <IconSolarSettingsOutline className="size-6" />
            </Button>
            <Badge content="9" color="danger" shape="circle">
              <Button isIconOnly variant="light" radius="full">
                <IconSolarBellOutline className="size-6" />
              </Button>
            </Badge>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-1">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
