import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'sonner'
import './index.css'
import App from './App.tsx'

console.log('[main] Starting...')

const rootEl = document.getElementById('root')
console.log('[main] #root element:', rootEl)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,
      refetchOnWindowFocus: true,
    },
    mutations: {
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { message?: string } } }
        const msg = err?.response?.data?.message || (error instanceof Error ? error.message : 'Terjadi kesalahan')
        toast.error(msg)
      },
    },
  },
})

try {
  console.log('[main] Rendering App...')
  createRoot(rootEl!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  )
  console.log('[main] Render called successfully')
} catch (err) {
  console.error('[main] RENDER FAILED:', err)
  if (rootEl) {
    rootEl.innerHTML = `<div style="padding:40px;color:red;font-family:sans-serif">
      <h2>Render Error</h2>
      <pre style="color:red">${err instanceof Error ? err.message : String(err)}</pre>
      <pre style="font-size:12px;color:#666">${err instanceof Error ? err.stack : ''}</pre>
    </div>`
  }
}
