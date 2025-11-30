<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import Container from '@/shared/components/ui/Container.vue'
import EmployeeTree from '@/features/employees/components/EmployeeTree.vue'
import BaseDialog from '@/shared/components/ui/BaseDialog.vue'
import EmployeeForm from '@/features/employees/components/EmployeeForm.vue'
import EmployeeDeleteDialog from '@/features/employees/components/EmployeeDeleteDialog.vue'
import {
  MagnifyingGlassIcon,
  UserIcon,
  ExclamationTriangleIcon,
  PlusIcon,
} from '@heroicons/vue/24/outline'
import { useDialog } from '@/shared/composables/useDialog'
import { useEmployeeStore } from '@/stores'
import { useUIStore } from '@/stores'
import { useDragAndDrop } from '@/features/employees/composables/useDragAndDrop'
import type {
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from '@/features/employees/types/employee.types'

// Stores
const employeeStore = useEmployeeStore()
const uiStore = useUIStore()

// Reactive refs from store
const { employees, loading, error, searchResults, searchLoading, totalEmployees, rootEmployees } =
  storeToRefs(employeeStore)

// UI Store methods
const { success, error: showError } = uiStore

// Local state
const searchInput = ref('')
const debouncedSearch = ref('')
const scrollToEmployeeId = ref('')
const treeRef = ref<InstanceType<typeof EmployeeTree> | null>(null)
const employeeFormRef = ref<InstanceType<typeof EmployeeForm> | null>(null)

// Dialog state using generic composable
const formDialog = useDialog()
const deleteDialog = useDialog()
const dialogMode = ref<'create' | 'edit' | 'add-subordinate'>('create')
const selectedEmployee = ref<Employee | null>(null)
const parentId = ref<string | null>(null)

const formLoading = ref(false)
const formError = ref<string | null>(null)

// Drag & Drop
const {
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleDropAsRoot,
  handleDropZoneDragOver,
  handleDropZoneDragLeave,
  handleDropZoneDrop,
  getDragClasses,
  getDropZoneClasses,
  isProcessing,
} = useDragAndDrop(employees, async (draggedId: string, newManagerId: string | null) => {
  try {
    await employeeStore.updateHierarchy(draggedId, newManagerId)

    const draggedName = employees.value.find((e) => e.id === draggedId)?.name || 'Employee'
    const managerName = newManagerId
      ? employees.value.find((e) => e.id === newManagerId)?.name
      : null

    // Wait for the tree to reorganize
    await nextTick()

    // NEW LOGIC: Collapse EVERYTHING, then expand only the path to the new parent
    if (treeRef.value) {
      // Collapse all nodes
      treeRef.value.collapseAll?.()

      // Expand only the path to the moved employee (now under the new parent)
      if (newManagerId) {
        // Small delay to allow time to collapse everything
        setTimeout(async () => {
          await treeRef.value?.expandPathToEmployee(draggedId)
        }, 100)
      }
      // If moved to root (newManagerId = null), leave everything collapsed
    }

    if (managerName) {
      success(`✅ ${draggedName} moved to ${managerName}'s team`)
    } else {
      success(`✅ ${draggedName} moved to Tier 1 (Top Level)`)
    }
  } catch (err) {
    // More specific error handling
    let errorMsg = 'Failed to move employee'

    if (err instanceof Error) {
      // Specific messages based on the error
      if (err.message.includes('cycle') || err.message.includes('circular')) {
        errorMsg = '⚠️ Cannot create circular reporting structure'
      } else if (err.message.includes('not found') || err.message.includes('404')) {
        errorMsg = '⚠️ Employee or manager not found'
      } else if (err.message.includes('permission') || err.message.includes('403')) {
        errorMsg = '⚠️ You do not have permission to move this employee'
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        errorMsg = '⚠️ Network error. Please check your connection'
      } else {
        errorMsg = `⚠️ ${err.message}`
      }
    }

    showError(errorMsg)
  }
})

let debounceTimer: number | null = null

watch(searchInput, (newValue) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = window.setTimeout(() => {
    debouncedSearch.value = newValue
  }, 300)
})

// Watch para busca server-side
watch(debouncedSearch, async (query) => {
  await employeeStore.searchEmployees(query)
})

const handleEmployeeClick = async (employeeId: string) => {
  // First, expand the path to the employee
  if (treeRef.value) {
    await treeRef.value.expandPathToEmployee(employeeId)
  }

  // Then, set the ID for scroll and animation
  scrollToEmployeeId.value = employeeId

  // Reset after a short period to allow future clicks
  setTimeout(() => {
    scrollToEmployeeId.value = ''
  }, 2000)
}

// CRUD handlers
const handleCreateEmployee = () => {
  dialogMode.value = 'create'
  selectedEmployee.value = null
  parentId.value = null
  formError.value = null
  formDialog.open()
}

const handleEdit = (employee: Employee) => {
  dialogMode.value = 'edit'
  selectedEmployee.value = employee
  parentId.value = null
  formError.value = null
  formDialog.open()
}

const handleAddSubordinate = (employee: Employee) => {
  dialogMode.value = 'add-subordinate'
  selectedEmployee.value = null
  parentId.value = employee.id
  formError.value = null
  formDialog.open()
}

const handleDelete = (employee: Employee) => {
  selectedEmployee.value = employee
  deleteDialog.open()
}

const closeFormDialog = () => {
  // Reset form antes de fechar
  employeeFormRef.value?.resetForm()

  formDialog.close()
  dialogMode.value = 'create'
  selectedEmployee.value = null
  parentId.value = null
  formError.value = null
}

const handleFormSubmit = async (formData: CreateEmployeeDto | UpdateEmployeeDto) => {
  formLoading.value = true
  formError.value = null

  try {
    if (dialogMode.value === 'edit' && selectedEmployee.value) {
      // Update existing employee
      const updated = await employeeStore.updateEmployee(
        selectedEmployee.value.id,
        formData as UpdateEmployeeDto,
      )

      success(`Employee "${updated.name}" updated successfully!`)
    } else if (dialogMode.value === 'create' || dialogMode.value === 'add-subordinate') {
      // Create new employee
      const createData: CreateEmployeeDto = {
        ...(formData as CreateEmployeeDto),
        reports_to_id:
          dialogMode.value === 'add-subordinate' ? parentId.value! : formData.reports_to_id,
      }

      const newEmployee = await employeeStore.createEmployee(createData)

      const action = dialogMode.value === 'add-subordinate' ? 'added as subordinate' : 'created'
      success(`Employee "${newEmployee.name}" ${action} successfully!`)
    }

    closeFormDialog()
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to save employee'
    formError.value = errorMsg
    showError(`❌ ${errorMsg}`)
  } finally {
    formLoading.value = false
  }
}

const handleDeleteConfirm = async () => {
  if (!selectedEmployee.value) return

  formLoading.value = true
  formError.value = null

  try {
    const employeeName = selectedEmployee.value.name
    await employeeStore.deleteEmployee(selectedEmployee.value.id)

    success(`Employee "${employeeName}" deleted successfully!`)
    deleteDialog.close()
    selectedEmployee.value = null
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to delete employee'
    formError.value = errorMsg
    showError(`❌ ${errorMsg}`)
  } finally {
    formLoading.value = false
  }
}

onMounted(async () => {
  await employeeStore.fetchAll()
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Header Section with Background -->
    <section class="relative bg-brand-dark py-12 overflow-hidden">
      <!-- Background Image -->
      <div class="absolute inset-0 opacity-30">
        <img src="/images/9.jpg" alt="Background" class="w-full h-full object-cover" />
      </div>

      <!-- Content -->
      <Container class="relative z-10">
        <div class="text-center text-white animate-fadeInUp">
          <h1 class="text-4xl sm:text-5xl font-bold mb-4">
            <span class="text-brand-green">Employee</span> Hierarchy
          </h1>
          <p class="text-xl opacity-90">Interactive organizational structure visualization</p>
        </div>
      </Container>
    </section>

    <!-- Search & Controls -->
    <section class="py-6 animate-fadeInUp" style="animation-delay: 0.1s">
      <Container>
        <div class="max-w-7xl mx-auto">
          <!-- Top Bar: Search + Stats + Button -->
          <div
            class="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between"
          >
            <!-- Search -->
            <div class="relative flex-1 lg:max-w-md">
              <MagnifyingGlassIcon
                class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[--color-neutral-400]"
              />
              <input
                v-model="searchInput"
                type="text"
                placeholder="Search employees by name or title..."
                class="w-full h-[52px] pl-12 pr-4 border-2 border-gray-300 rounded-xl focus:border-brand-green focus:outline-none transition-colors text-[15px]"
              />
            </div>

            <!-- Stats + Button Container -->
            <div class="flex flex-wrap sm:flex-nowrap gap-3 items-center">
              <!-- Stats Pills - Inline & Compact -->
              <div class="flex gap-2 items-center">
                <!-- Total Employees -->
                <div
                  class="bg-white border-2 border-gray-200 rounded-xl px-4 h-[52px] hover:border-brand-green transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span class="text-2xl font-bold text-brand-green">{{ totalEmployees }}</span>
                  <span class="text-sm text-gray-600 font-medium whitespace-nowrap">Employees</span>
                </div>

                <!-- Separator -->
                <div class="w-px h-6 bg-gray-300"></div>

                <!-- Top CEOs -->
                <div
                  class="bg-white border-2 border-gray-200 rounded-xl px-4 h-[52px] hover:border-brand-green transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span class="text-2xl font-bold text-brand-green">{{
                    rootEmployees.length
                  }}</span>
                  <span class="text-sm text-gray-600 font-medium whitespace-nowrap">Top CEOs</span>
                </div>
              </div>

              <!-- Add Employee Button -->
              <button
                @click="handleCreateEmployee"
                class="px-6 h-[52px] bg-brand-green text-white rounded-xl font-semibold hover:bg-brand-green/90 shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <PlusIcon class="w-5 h-5" />
                Add Employee
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>

    <!-- Hierarchy Visualization -->
    <section class="pb-12 animate-fadeInUp" style="animation-delay: 0.2s">
      <Container>
        <div class="max-w-7xl mx-auto">
          <!-- Error State -->
          <div v-if="error" class="bg-gray-50 rounded-2xl p-8 text-center shadow-sm">
            <div class="flex justify-center mb-4">
              <ExclamationTriangleIcon class="w-16 h-16 text-gray-400" />
            </div>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">Error Loading Data</h3>
            <p class="text-gray-500 text-sm mb-6 max-w-md mx-auto">{{ error }}</p>
            <div class="flex justify-center gap-3">
              <button
                @click="() => employeeStore.fetchAll()"
                class="px-5 py-2.5 bg-brand-green text-white rounded-xl font-medium hover:bg-brand-green/90 transition-all shadow-sm hover:shadow-md text-sm"
              >
                Try Again
              </button>
              <a
                href="/"
                class="px-5 py-2.5 bg-white text-gray-600 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm"
              >
                Go Home
              </a>
            </div>
          </div>

          <!-- Loading State -->
          <div v-else-if="loading" class="text-center py-20">
            <div
              class="inline-block w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin"
            ></div>
            <p class="mt-4 text-[--color-neutral-600]">Loading hierarchy...</p>
          </div>

          <!-- Tree Visualization -->
          <div v-else class="space-y-6">
            <!-- Search Loading State -->
            <div
              v-if="searchLoading"
              class="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 text-center"
            >
              <div class="flex items-center justify-center gap-3">
                <div
                  class="w-5 h-5 border-2 border-brand-green border-t-transparent rounded-full animate-spin"
                ></div>
                <span class="text-gray-600 font-medium">Searching employees...</span>
              </div>
            </div>

            <!-- Search Results Panel -->
            <div
              v-else-if="searchResults.length > 0"
              class="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-blue-900">
                  Found {{ searchResults.length }}
                  {{ searchResults.length === 1 ? 'employee' : 'employees' }}
                </h3>
              </div>

              <div
                class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto px-2 pt-2 pb-6"
              >
                <div
                  v-for="employee in searchResults"
                  :key="employee.id"
                  class="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg hover:border-brand-green transition-all cursor-pointer border-2 border-transparent"
                  @click="handleEmployeeClick(employee.id)"
                >
                  <div class="flex items-center gap-3">
                    <!-- Avatar with image, icon or initials -->
                    <div
                      class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-brand-green font-bold text-sm overflow-hidden"
                      :class="
                        !employee.profile_image_url || !employee.profile_image_url.trim()
                          ? 'bg-brand-green/10'
                          : employee.profile_image_url.startsWith('data:image')
                            ? 'bg-gray-100'
                            : 'bg-gray-100'
                      "
                    >
                      <!-- Base64 image -->
                      <img
                        v-if="
                          employee.profile_image_url &&
                          employee.profile_image_url.startsWith('data:image')
                        "
                        :key="employee.profile_image_url"
                        :src="employee.profile_image_url"
                        :alt="employee.name"
                        class="w-full h-full object-cover"
                      />
                      <!-- User icon for invalid paths -->
                      <UserIcon
                        v-else-if="
                          employee.profile_image_url &&
                          !employee.profile_image_url.startsWith('data:image')
                        "
                        class="w-6 h-6 text-brand-green"
                      />
                      <!-- Initials fallback -->
                      <span v-else>
                        {{
                          employee.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()
                        }}
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="font-semibold text-gray-900 truncate">{{ employee.name }}</div>
                      <div class="text-sm text-gray-600 truncate">{{ employee.title }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Full Tree (collapsed when searching) -->
            <div class="bg-white rounded-2xl p-8 shadow-lg">
              <EmployeeTree
                ref="treeRef"
                :employees="employees"
                :search-query="debouncedSearch"
                :scroll-to-id="scrollToEmployeeId"
                :drag-classes-fn="getDragClasses"
                :drop-zone-classes-fn="getDropZoneClasses"
                @edit="handleEdit"
                @add-subordinate="handleAddSubordinate"
                @delete="handleDelete"
                @drag-start="handleDragStart"
                @drag-end="handleDragEnd"
                @drag-over="handleDragOver"
                @drag-leave="handleDragLeave"
                @drop="handleDrop"
                @drop-zone-drag-over="handleDropZoneDragOver"
                @drop-zone-drag-leave="handleDropZoneDragLeave"
                @drop-zone-drop="handleDropZoneDrop"
                @drop-as-root="handleDropAsRoot"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>

    <!-- Form Dialog (Create/Edit/Add Subordinate) -->
    <BaseDialog
      v-model:open="formDialog.isOpen.value"
      :title="
        dialogMode === 'edit'
          ? 'Edit Employee'
          : dialogMode === 'add-subordinate'
            ? 'Add Subordinate'
            : 'Create Employee'
      "
      size="xl"
    >
      <!-- Error Display - NO TOPO -->
      <div
        v-if="formError"
        class="mb-4 p-4 bg-red-50 border-2 border-red-400 rounded-xl flex items-start gap-3 animate-shake"
      >
        <svg class="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="flex-1">
          <p class="text-sm font-semibold text-red-900">Error</p>
          <p class="text-sm text-red-800 mt-1">{{ formError }}</p>
        </div>
        <button
          @click="formError = null"
          class="shrink-0 text-red-600 hover:text-red-800 transition-colors"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <EmployeeForm
        ref="employeeFormRef"
        :employee="dialogMode === 'edit' ? (selectedEmployee ?? undefined) : undefined"
        :parent-id="dialogMode === 'add-subordinate' ? (parentId ?? undefined) : undefined"
        :all-employees="employees"
        @submit="handleFormSubmit"
        @cancel="closeFormDialog"
      />
    </BaseDialog>

    <!-- Delete Confirmation Dialog -->
    <EmployeeDeleteDialog
      v-model:open="deleteDialog.isOpen.value"
      :employee="selectedEmployee"
      :on-confirm="handleDeleteConfirm"
    />

    <!-- Loading Overlay durante Drop -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isProcessing"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-9999 flex items-center justify-center"
      >
        <div class="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
          <div
            class="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin"
          ></div>
          <p class="text-lg font-semibold text-gray-900">Reorganizing hierarchy...</p>
          <p class="text-sm text-gray-600">Please wait</p>
        </div>
      </div>
    </Transition>
  </div>
</template>
