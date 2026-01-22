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
        element: <ComingSoon />,
        handle: {
          title: 'Panel Principal',
        },
      },
      {
        path: 'pos',
        element: <ComingSoon />,
        handle: {
          title: 'Punto de Venta',
        },
      },
      {
        path: 'customers',
        element: <ComingSoon />,
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
        element: <ComingSoon />,
        handle: {
          title: 'Inventario',
        },
      },
      {
        path: 'inventory-entry',
        element: <ComingSoon />,
        handle: {
          title: 'Entrada de Inventario',
        },
      },
      {
        path: 'purchase-orders',
        element: <ComingSoon />,
        handle: {
          title: 'Ordenes de Compra',
        },
      },
      {
        path: 'adjustments',
        element: <ComingSoon />,
        handle: {
          title: 'Ajustes y Merma',
        },
      },
      {
        path: 'suppliers',
        element: <ComingSoon />,
        handle: {
          title: 'Proveedores',
        },
      },
      {
        path: 'credits',
        element: <ComingSoon />,
        handle: {
          title: 'Créditos',
        },
      },
      {
        path: 'expenses',
        element: <ComingSoon />,
        handle: {
          title: 'Gastos',
        },
      },
      {
        path: 'reports',
        element: <ComingSoon />,
        handle: {
          title: 'Reportes',
        },
      },
      {
        path: 'cash',
        element: <ComingSoon />,
        handle: {
          title: 'Caja',
        },
      },
      {
        path: 'help',
        element: <ComingSoon />,
        handle: {
          title: 'Ayuda',
        },
      },
      {
        path: 'settings',
        element: <ComingSoon />,
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
