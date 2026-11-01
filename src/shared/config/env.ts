export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  apiMocking: import.meta.env.VITE_API_MOCKING === 'enabled',
} as const
