/**
 * Employee Types
 */

export interface Employee {
  id: string
  name: string
  title: string
  reports_to_id: string | null
  profile_image_url: string
  timezone: string
  manager?: Employee
  subordinates?: Employee[]
}

export interface CreateEmployeeDto {
  name: string
  title: string
  reports_to_id?: string | null
  profile_image_url: string
  timezone: string
}

export interface UpdateEmployeeDto {
  name?: string
  title?: string
  reports_to_id?: string | null
  profile_image_url?: string
  timezone?: string
}

export interface UpdateHierarchyDto {
  new_manager_id: string | null
}

/**
 * Frontend-specific types
 */
export interface EmployeeTreeNode extends Employee {
  subordinates: EmployeeTreeNode[]
  level?: number
  isExpanded?: boolean
}

export interface EmployeeFilters {
  search?: string
}
