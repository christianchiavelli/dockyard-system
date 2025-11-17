/**
 * Employee API Service
 * Handles all employee-related API calls
 */

import type {
  CreateEmployeeDto,
  Employee,
  UpdateEmployeeDto,
  UpdateHierarchyDto,
} from '@/features/employees/types/employee.types'

import { BaseApiService } from '@/shared/services/base-api.service'

class EmployeeApiService extends BaseApiService<Employee> {
  constructor() {
    super('/api/employees')
  }

  /**
   * Get all employees or search by name
   * @param search - Optional search query for filtering by name
   */
  async getAll(search?: string): Promise<Employee[]> {
    return this.get<Employee[]>('', search ? { search } : undefined)
  }

  /**
   * Get employee hierarchy (tree structure)
   * Returns root employees with nested subordinates
   */
  async getHierarchy(): Promise<Employee[]> {
    return this.get<Employee[]>('/hierarchy')
  }

  /**
   * Get root-level employees (no manager)
   */
  async getRoots(): Promise<Employee[]> {
    return this.get<Employee[]>('/roots')
  }

  /**
   * Get employee by ID
   * @param id - Employee UUID
   */
  async getById(id: string): Promise<Employee> {
    return this.get<Employee>(`/${id}`)
  }

  /**
   * Create new employee
   * @param data - Employee creation data
   */
  async create(data: CreateEmployeeDto): Promise<Employee> {
    return this.post<Employee>('', data)
  }

  /**
   * Bulk create employees (for seeding)
   * @param employees - Array of employee creation data
   */
  async createBulk(employees: CreateEmployeeDto[]): Promise<Employee[]> {
    return this.post<Employee[]>('/bulk', employees)
  }

  /**
   * Update employee
   * @param id - Employee UUID
   * @param data - Partial employee data to update
   */
  async update(id: string, data: UpdateEmployeeDto): Promise<Employee> {
    return this.put<Employee>(`/${id}`, data)
  }

  /**
   * Update employee hierarchy (drag & drop)
   * @param id - Employee UUID
   * @param newManagerId - New manager UUID or null for root level
   */
  async updateHierarchy(id: string, newManagerId: string | null): Promise<Employee> {
    const data: UpdateHierarchyDto = {
      new_manager_id: newManagerId,
    }
    return this.put<Employee>(`/${id}/hierarchy`, data)
  }

  /**
   * Delete employee
   * Note: Backend validates that employee has no subordinates
   * @param id - Employee UUID
   */
  async remove(id: string): Promise<void> {
    return this.delete<void>(`/${id}`)
  }
}

// Export singleton instance
export const employeeApi = new EmployeeApiService()
