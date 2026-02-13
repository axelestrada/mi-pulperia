import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { HeroUIProvider, ToastProvider } from '@heroui/react'

import { router } from './routes'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HeroUIProvider>
    <QueryClientProvider client={queryClient}>
      <main className="text-foreground bg-background">
        <RouterProvider router={router} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              title: 'text-sm font-semibold',
              description: 'text-sm text-default-500 font-normal',
              error: '!text-danger',
              info: '!text-info',
              warning: '!text-warning',
            },
          }}
          icons={{
            error: <IconLucideInfo className="text-danger" />,
            success: <IconLucideCircleCheck className="text-success" />,
            info: <IconLucideInfo className="text-info" />,
            warning: <IconLucideTriangleAlert className="text-warning" />,
          }}
        />
        <ToastProvider />
      </main>
    </QueryClientProvider>
  </HeroUIProvider>
)
