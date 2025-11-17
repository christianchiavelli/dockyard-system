/**
 * API Error structure returned by NestJS
 */
export interface ApiError {
  message: string
  statusCode: number
  error?: string
  timestamp?: string
}
