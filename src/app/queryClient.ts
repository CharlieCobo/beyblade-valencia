import { QueryClient } from '@tanstack/react-query'

// Cliente único de la app. Las mutaciones no reintentan (valor por defecto de TanStack Query).
export const queryClient = new QueryClient()
