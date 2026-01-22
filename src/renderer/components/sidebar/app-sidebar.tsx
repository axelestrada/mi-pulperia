import * as React from 'react'
import {
  LifeBuoy,
  ShoppingBasket,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  CreditCard,
  DollarSign,
  FileChartColumn,
  Coins,
  Settings,
} from 'lucide-react'

import { Sidebar } from '@/components/ui/sidebar'

const data = {
  user: {
    name: 'Ena Raudales',
    email: 'enaraudales@gmail.com',
    avatar: '/images/avatars/woman.jpg',
  },
  navMain: [
    {
      title: 'Panel Principal',
      url: '/',
      icon: LayoutDashboard,
    },
    {
      title: 'Punto de Venta',
      shortcut: 'F2',
      url: 'pos',
      icon: ShoppingCart,
    },
    {
      title: 'Clientes',
      url: 'customers',
      icon: Users,
    },
    {
      title: 'Productos',
      url: 'products',
      icon: Package,
      isActive: true,
      items: [
        {
          title: 'Lista de Productos',
          url: 'products',
        },
        {
          title: 'Categorías',
          url: 'categories',
        },
        {
          title: 'Inventario',
          url: 'inventory',
        },
        {
          title: 'Ordenes de Compra',
          url: 'purchase-orders',
        },
        {
          title: 'Ajustes y Merma',
          url: 'adjustments',
        },
        {
          title: 'Proveedores',
          url: 'suppliers',
        },
      ],
    },
    {
      title: 'Créditos',
      url: 'credits',
      icon: CreditCard,
    },
    {
      title: 'Gastos',
      url: 'expenses',
      icon: DollarSign,
    },
    {
      title: 'Reportes',
      url: 'reports',
      icon: FileChartColumn,
    },
    {
      title: 'Caja',
      url: 'cash',
      icon: Coins,
    },
  ],
  navSecondary: [
    {
      title: 'Ayuda',
      url: 'help',
      icon: LifeBuoy,
    },
    {
      title: 'Configuración',
      url: 'settings',
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <ShoppingBasket className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Mi Pulpería</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
