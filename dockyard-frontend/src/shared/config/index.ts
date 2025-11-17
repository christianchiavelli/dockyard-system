/**
 * Environment Configuration
 */

export const config = {
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: 30000, // 30 seconds
  },
  app: {
    name: 'Dockyard',
    version: '1.0.0',
  },
} as const

export type Config = typeof config
