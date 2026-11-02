import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router'

interface ProvidersOptions {
  /** Ruta inicial del router en memoria. Por defecto `/`. */
  route?: string
}

function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
}

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', ...options }: ProvidersOptions & Omit<RenderOptions, 'wrapper'> = {},
) {
  // Un QueryClient por render para que no se comparta caché entre tests.
  const queryClient = createTestQueryClient()

  function AllProviders({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  return {
    user: userEvent.setup(),
    queryClient,
    ...render(ui, { wrapper: AllProviders, ...options }),
  }
}

export * from '@testing-library/react'
