import * as React from "react";
import {
  LifeBuoy, ShoppingBasket,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  CreditCard,
  DollarSign,
  FileChartColumn,
  Coins,
  UserSearch,
  Settings
} from "lucide-react";

import {
  Sidebar,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Ena Raudales",
    email: "enaraudales@gmail.com",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
  },
  navMain: [
    {
      title: "Panel Principal",
      url: "#",
      icon: LayoutDashboard,
    },
    {
      title: "Punto de Venta",
      shortcut: "F2",
      url: "#",
      icon: ShoppingCart,
    },
    {
      title: "Clientes",
      url: "#",
      icon: Users,
    },
    {
      title: "Productos",
      url: "#",
      icon: Package,
      isActive: true,
      items: [
        {
          title: "Lista de Productos",
          url: "#",
        },
        {
          title: "Categorías",
          url: "#",
        },
        {
          title: "Movimientos",
          url: "#",
        },
        {
          title: "Ordenes de Compra",
          url: "#",
        },
        {
          title: "Ajustes y Merma",
          url: "#",
        },
        {
          title: "Proveedores",
          url: "#",
        },
      ],
    },
    {
      title: "Créditos",
      url: "#",
      icon: CreditCard,
    },
    {
      title: "Gastos",
      url: "#",
      icon: DollarSign,
    },
    {
      title: "Reportes",
      url: "#",
      icon: FileChartColumn,
    },
    {
      title: "Caja",
      url: "#",
      icon: Coins,
    },
     {
      title: "Auditoría",
      url: "#",
      icon: UserSearch,
    },
  ],
  navSecondary: [
    {
      title: "Ayuda",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Configuración",
      url: "#",
      icon: Settings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <ShoppingBasket className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Mi Pulpería</span>
                </div>
              </a>
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
  );
}
