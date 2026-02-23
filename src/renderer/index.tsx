import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sileo'

import { router } from './routes'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HeroUIProvider>
    <QueryClientProvider client={queryClient}>
      <main className="text-foreground bg-background">
        <RouterProvider router={router} />

        <div className="z-100 fixed top-0 right-0 left-0 bottom-0 pointer-events-none">
          <Toaster
            position="top-center"
            options={{
              fill: '#11181C',
              styles: {
                description: 'text-default-50',
              },
            }}
          />
        </div>
        <ToastProvider />
      </main>
    </QueryClientProvider>
  </HeroUIProvider>
)
