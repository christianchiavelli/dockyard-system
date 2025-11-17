/**
 * HTTP Client Configuration
 * Configured Axios instance with interceptors for error handling and dev logging
 */

import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { config } from '@/shared/config'
import type { ApiError } from '@/shared/types/api.types'

const httpClient: AxiosInstance = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError<ApiError>) => {
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'Unknown error occurred',
      statusCode: error.response?.status || 500,
      error: error.response?.data?.error,
      timestamp: new Date().toISOString(),
    }

    return Promise.reject(apiError)
  },
)

export default httpClient
