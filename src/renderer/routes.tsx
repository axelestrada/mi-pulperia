import { createHashRouter } from 'react-router-dom'

export const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    handle: {
      title: 'Panel Principal',
    },
    children: [
      {
        index: true,
        element: <DashboardPage />,
        handle: {
          title: 'Panel Principal',
        },
      },
      {
        path: 'pos',
        element: <PosPage />,
        handle: {
          title: 'Punto de Venta',
        },
      },
      {
        path: 'customers',
        element: <CustomersPage />,
        handle: {
          title: 'Clientes',
        },
      },
      {
        path: 'products',
        element: <ProductsPage />,
        handle: {
          title: 'Productos',
        },
      },
      {
        path: 'categories',
        element: <CategoriesPage />,
        handle: {
          title: 'Categorías',
        },
      },
      {
        path: 'inventory',
        element: <InventoryPage />,
        handle: {
          title: 'Inventario',
        },
      },
      {
        path: 'inventory-entry',
        element: <InventoryEntryPage />,
        handle: {
          title: 'Entrada de Inventario',
        },
      },
      {
        path: 'purchase-orders',
        element: <PurchaseOrdersPage />,
        handle: {
          title: 'Ordenes de Compra',
        },
      },
      {
        path: 'adjustments',
        element: <AdjustmentsPage />,
        handle: {
          title: 'Ajustes y Merma',
        },
      },
      {
        path: 'suppliers',
        element: <SuppliersPage />,
        handle: {
          title: 'Proveedores',
        },
      },
      {
        path: 'credits',
        element: <CreditsPage />,
        handle: {
          title: 'Créditos',
        },
      },
      {
        path: 'expenses',
        element: <ExpensesPage />,
        handle: {
          title: 'Gastos',
        },
      },
      {
        path: 'reports',
        element: <ReportsPage />,
        handle: {
          title: 'Reportes',
        },
      },
      {
        path: 'sales',
        element: <SalesPage />,
        handle: {
          title: 'Ventas',
        },
      },
      {
        path: 'cash',
        element: <CashPage />,
        handle: {
          title: 'Caja',
        },
      },
      {
        path: 'help',
        element: <HelpPage />,
        handle: {
          title: 'Ayuda',
        },
      },
      {
        path: 'settings',
        element: <SettingsPage />,
        handle: {
          title: 'Configuración',
        },
      },
      {
        path: '*',
        element: <NotFoundPage />,
        handle: { title: 'Página no encontrada' },
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
    handle: { title: 'Página no encontrada' },
  },
])
