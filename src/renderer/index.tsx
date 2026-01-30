import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { HeroUIProvider } from '@heroui/react'

import { router } from './routes'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HeroUIProvider>
    <QueryClientProvider client={queryClient}>
      <main className="text-foreground bg-background">
        <RouterProvider router={router} />
        <Toaster position="bottom-right" />
      </main>
    </QueryClientProvider>
  </HeroUIProvider>
)
