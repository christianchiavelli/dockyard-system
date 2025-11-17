/**
 * Base API Service
 * Generic service with common HTTP methods
 */

import type { AxiosResponse } from 'axios'
import httpClient from '@/shared/services/http.service'

export abstract class BaseApiService<T> {
  constructor(protected readonly basePath: string) {}

  /**
   * GET request
   */
  protected async get<R = T>(path: string = '', params?: Record<string, unknown>): Promise<R> {
    const response: AxiosResponse<R> = await httpClient.get(`${this.basePath}${path}`, { params })
    return response.data
  }

  /**
   * POST request
   */
  protected async post<R = T>(path: string = '', data?: unknown): Promise<R> {
    const response: AxiosResponse<R> = await httpClient.post(`${this.basePath}${path}`, data)
    return response.data
  }

  /**
   * PUT request
   */
  protected async put<R = T>(path: string = '', data?: unknown): Promise<R> {
    const response: AxiosResponse<R> = await httpClient.put(`${this.basePath}${path}`, data)
    return response.data
  }

  /**
   * DELETE request
   */
  protected async delete<R = void>(path: string = ''): Promise<R> {
    const response: AxiosResponse<R> = await httpClient.delete(`${this.basePath}${path}`)
    return response.data
  }
}
