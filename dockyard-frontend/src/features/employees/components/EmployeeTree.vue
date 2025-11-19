<script setup lang="ts">
import { computed, ref } from 'vue'
import EmployeeNode from '@/features/employees/components/EmployeeNode.vue'
import type { Employee } from '@/features/employees/types/employee.types'

interface Props {
  employees: Employee[]
  searchQuery?: string
  scrollToId?: string
  dragClassesFn?: (employee: Employee) => string
  dropZoneClassesFn?: (zoneId: string) => string
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
  scrollToId: '',
  dragClassesFn: () => '',
  dropZoneClassesFn: () => '',
})

interface Emits {
  (e: 'edit', employee: Employee): void
  (e: 'addSubordinate', employee: Employee): void
  (e: 'delete', employee: Employee): void
  (e: 'dragStart', employee: Employee, event: DragEvent): void
  (e: 'dragEnd'): void
  (e: 'dragOver', employee: Employee, event: DragEvent): void
  (e: 'dragLeave'): void
  (e: 'drop', employee: Employee, event: DragEvent): void
  (e: 'dropZoneDragOver', zoneId: string, event: DragEvent): void
  (e: 'dropZoneDragLeave'): void
  (e: 'dropZoneDrop', targetEmployeeId: string, event: DragEvent): void
  (e: 'dropAsRoot', event: DragEvent): void
}

const emit = defineEmits<Emits>()

const rootNodeRefs = ref<InstanceType<typeof EmployeeNode>[]>([])

// Get root employees (CEOs with no manager)
const rootEmployees = computed(() => props.employees.filter((emp) => emp.reports_to_id === null))

// Get filtered results count
const filteredCount = computed(() => {
  if (!props.searchQuery.trim()) return props.employees.length

  const query = props.searchQuery.toLowerCase()
  return props.employees.filter(
    (emp) => emp.name.toLowerCase().includes(query) || emp.title.toLowerCase().includes(query),
  ).length
})

// Function to expand the path to a specific employee
const expandPathToEmployee = async (targetId: string): Promise<void> => {
  for (const nodeRef of rootNodeRefs.value) {
    if (nodeRef) {
      const found = await nodeRef.expandPath(targetId)
      if (found) break
    }
  }
}

// Function to collapse a specific employee
const collapseEmployee = (employeeId: string): void => {
  // Search for the employee in all nodes (recursively)
  const findAndCollapse = (nodeRef: InstanceType<typeof EmployeeNode> | undefined): boolean => {
    if (!nodeRef) return false

    // If this is the target employee, collapse it
    if (nodeRef.employee?.id === employeeId) {
      if (nodeRef.collapse) {
        nodeRef.collapse()
      }
      return true
    }

    // Search recursively in children
    // @ts-expect-error - childRefs exists but is not in the type
    if (nodeRef.childRefs) {
      // @ts-expect-error - childRefs array is not typed in InstanceType
      for (const childRef of nodeRef.childRefs) {
        if (findAndCollapse(childRef)) {
          return true
        }
      }
    }

    return false
  }

  // Try each root node
  for (const rootNodeRef of rootNodeRefs.value) {
    if (findAndCollapse(rootNodeRef)) {
      break
    }
  }
}

// Function to collapse ALL employees
const collapseAll = (): void => {
  const collapseRecursive = (nodeRef: InstanceType<typeof EmployeeNode> | undefined): void => {
    if (!nodeRef) return

    // Collapse this node
    if (nodeRef.collapse) {
      nodeRef.collapse()
    }

    // Recursively collapse all children
    // @ts-expect-error - childRefs exists but is not in the type
    if (nodeRef.childRefs) {
      // @ts-expect-error - childRefs array is not typed in InstanceType
      for (const childRef of nodeRef.childRefs) {
        collapseRecursive(childRef)
      }
    }
  }

  // Collapse all root nodes
  for (const rootNodeRef of rootNodeRefs.value) {
    collapseRecursive(rootNodeRef)
  }
}

// Forward events from child nodes
const handleEdit = (employee: Employee) => emit('edit', employee)
const handleAddSubordinate = (employee: Employee) => emit('addSubordinate', employee)
const handleDelete = (employee: Employee) => emit('delete', employee)

defineExpose({ expandPathToEmployee, collapseEmployee, collapseAll })
</script>

<template>
  <div class="space-y-4">
    <!-- Search Results Info -->
    <div v-if="searchQuery.trim()" class="text-sm text-gray-600 mb-4">
      Found <span class="font-bold text-brand-green">{{ filteredCount }}</span>
      {{ filteredCount === 1 ? 'employee' : 'employees' }} matching "<span class="font-semibold">{{
        searchQuery
      }}</span
      >"
    </div>

    <!-- Empty State -->
    <div v-if="rootEmployees.length === 0" class="text-center py-12">
      <div class="text-4xl mb-4">🔍</div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">No employees found</h3>
      <p class="text-gray-600">Try adjusting your search query</p>
    </div>

    <!-- Tree Nodes -->
    <div v-else class="space-y-3">
      <!-- Drop Zone TOPO - Para tornar Tier 1 (Root) -->
      <div
        class="mx-2 my-1 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center"
        :class="dropZoneClassesFn('root-zone')"
        @dragover="(e) => emit('dropZoneDragOver', 'root-zone', e as DragEvent)"
        @dragleave="emit('dropZoneDragLeave')"
        @drop="(e) => emit('dropAsRoot', e as DragEvent)"
      >
        <span class="text-xs text-brand-green font-bold">Drop here to make Tier 1 (Top Level)</span>
      </div>

      <EmployeeNode
        v-for="employee in rootEmployees"
        :key="`${employee.id}-${employee.profile_image_url?.substring(0, 20) || 'no-img'}`"
        :ref="
          (el) => {
            const index = rootEmployees.indexOf(employee)
            if (el) rootNodeRefs[index] = el as InstanceType<typeof EmployeeNode>
          }
        "
        :employee="employee"
        :all-employees="employees"
        :search-query="searchQuery"
        :level="0"
        :scroll-to-id="scrollToId"
        :drag-classes="dragClassesFn(employee)"
        :drag-classes-fn="dragClassesFn"
        :drop-zone-classes-fn="dropZoneClassesFn"
        @edit="handleEdit"
        @add-subordinate="handleAddSubordinate"
        @delete="handleDelete"
        @drag-start="(emp, e) => emit('dragStart', emp, e)"
        @drag-end="emit('dragEnd')"
        @drag-over="(emp, e) => emit('dragOver', emp, e)"
        @drag-leave="emit('dragLeave')"
        @drop="(emp, e) => emit('drop', emp, e)"
        @drop-zone-drag-over="(zoneId, e) => emit('dropZoneDragOver', zoneId, e)"
        @drop-zone-drag-leave="emit('dropZoneDragLeave')"
        @drop-zone-drop="(targetId, e) => emit('dropZoneDrop', targetId, e)"
      />
    </div>
  </div>
</template>
