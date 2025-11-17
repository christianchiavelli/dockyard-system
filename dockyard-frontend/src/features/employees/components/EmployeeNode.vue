<script setup lang="ts">
import { ref, computed, toRef } from 'vue'
import {
  ChevronRightIcon,
  ChevronDownIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
  Bars3Icon,
} from '@heroicons/vue/24/outline'
import type { Employee } from '@/features/employees/types/employee.types'
import { useEmployeeTree } from '@/features/employees/composables/useEmployeeTree'
import { useEmployeeHighlight } from '@/features/employees/composables/useEmployeeHighlight'
import { useEmployeeFormat } from '@/features/employees/composables/useEmployeeFormat'
import { useEmployeeImage } from '@/features/employees/composables/useEmployeeImage'

interface Props {
  employee: Employee
  allEmployees: Employee[]
  searchQuery?: string
  level?: number
  scrollToId?: string
  dragClasses?: string
  dragClassesFn?: (employee: Employee) => string
  dropZoneClassesFn?: (zoneId: string) => string
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
  level: 0,
  scrollToId: '',
  dragClasses: '',
  dragClassesFn: () => '',
  dropZoneClassesFn: () => '',
})

const emit = defineEmits([
  'edit',
  'addSubordinate',
  'delete',
  'dragStart',
  'dragEnd',
  'dragOver',
  'dragLeave',
  'drop',
  'dropZoneDragOver',
  'dropZoneDragLeave',
  'dropZoneDrop',
  'expand',
])

// Refs
const cardRef = ref<HTMLElement | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const childRefs = ref<any[]>([])

// Convert props to refs for composables
const employeeRef = toRef(props, 'employee')
const allEmployeesRef = toRef(props, 'allEmployees')
const scrollToIdRef = toRef(props, 'scrollToId')

// Callback for when a child is expanded - collapses siblings
const handleChildExpand = (childId: string) => {
  // Collapse all other siblings (keep only the one that was expanded)
  subordinates.value.forEach((sibling) => {
    if (sibling.id !== childId) {
      const childRef = childRefs.value.find((ref) => ref?.employee?.id === sibling.id)
      if (childRef && childRef.collapse) {
        childRef.collapse()
        childRef.collapseAllChildren()
      }
    }
  })
}

// Custom toggle function that notifies the parent
const handleToggleExpand = () => {
  toggleExpand()
  if (isExpanded.value) {
    emit('expand', props.employee.id)
  }
}

const {
  isExpanded,
  subordinates,
  hasSubordinates,
  toggleExpand,
  expandPath,
  collapse,
  collapseAllChildren,
} = useEmployeeTree(employeeRef, allEmployeesRef, childRefs)

const { isHighlighted } = useEmployeeHighlight(employeeRef, scrollToIdRef, cardRef)

const { getInitials, getLevelLabel } = useEmployeeFormat()

const { hasValidImage, imageLoadError, handleImageError } = useEmployeeImage(employeeRef)

const matchesSearch = computed(() => {
  if (!props.searchQuery.trim()) return false
  const query = props.searchQuery.toLowerCase()
  return (
    props.employee.name.toLowerCase().includes(query) ||
    props.employee.title.toLowerCase().includes(query)
  )
})

const indentClass = computed(() => {
  return props.level === 0 ? '' : 'ml-6'
})

defineExpose({ expandPath, collapse, collapseAllChildren })
</script>

<template>
  <div :class="indentClass">
    <div
      v-if="level > 0"
      class="mx-2 my-1 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center"
      :class="dropZoneClassesFn(`before-${employee.id}`)"
      @dragover="(e) => emit('dropZoneDragOver', `before-${employee.id}`, e as DragEvent)"
      @dragleave="emit('dropZoneDragLeave')"
      @drop="(e) => emit('dropZoneDrop', employee.id, e as DragEvent)"
    >
      <span class="text-xs text-gray-500 font-medium">Drop here to become subordinate</span>
    </div>

    <div
      ref="cardRef"
      draggable="true"
      class="relative rounded-xl transition-all duration-300 ease-in-out group select-none border-2 isolate cursor-grab active:cursor-grabbing"
      :class="[
        isHighlighted ? 'bg-brand-green/10 border-brand-green' : 'bg-white hover:bg-gray-50',
        matchesSearch ? 'bg-brand-green/10 border-brand-green' : '',
        !isHighlighted && !matchesSearch ? 'border-gray-200 hover:border-gray-300' : '',
        hasSubordinates ? 'hover:shadow-md' : '',
        dragClasses,
      ]"
      :aria-label="`${employee.name}, ${employee.title}`"
      role="button"
      tabindex="0"
      @dragstart="(e) => emit('dragStart', employee, e as DragEvent)"
      @dragend="emit('dragEnd')"
      @dragover="(e) => emit('dragOver', employee, e as DragEvent)"
      @dragleave="emit('dragLeave')"
      @drop="(e) => emit('drop', employee, e as DragEvent)"
    >
      <div class="hidden md:flex items-center gap-3 p-4">
        <div
          class="shrink-0 w-6 h-6 flex items-center justify-center text-gray-400"
          title="Drag handle"
        >
          <Bars3Icon class="w-5 h-5" />
        </div>

        <!-- Expand/Collapse Button -->
        <button
          v-if="hasSubordinates"
          draggable="false"
          class="shrink-0 w-6 h-6 text-gray-400 hover:text-brand-green transition-colors cursor-pointer"
          @click.stop="handleToggleExpand"
          @mousedown.stop
        >
          <ChevronDownIcon v-if="isExpanded" class="w-6 h-6" />
          <ChevronRightIcon v-else class="w-6 h-6" />
        </button>
        <div v-else class="w-6 shrink-0"></div>

        <!-- Avatar -->
        <div
          draggable="false"
          class="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden"
          :class="[
            !hasValidImage ? (level === 0 ? 'bg-brand-green' : 'bg-blue-500') : 'bg-gray-100',
            hasSubordinates ? 'cursor-pointer' : '',
          ]"
          @click="hasSubordinates ? handleToggleExpand() : undefined"
        >
          <img
            v-if="
              employee.profile_image_url &&
              employee.profile_image_url.startsWith('data:image') &&
              !imageLoadError
            "
            :key="employee.profile_image_url"
            :src="employee.profile_image_url"
            :alt="employee.name"
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
          <UserIcon
            v-else-if="
              employee.profile_image_url && !employee.profile_image_url.startsWith('data:image')
            "
            class="w-7 h-7 text-brand-green"
          />
          <span v-else>{{ getInitials(employee.name) }}</span>
        </div>

        <!-- Employee Info -->
        <div
          draggable="false"
          class="flex-1 min-w-0"
          :class="hasSubordinates ? 'cursor-pointer' : ''"
          @click="hasSubordinates ? handleToggleExpand() : undefined"
        >
          <div class="font-semibold text-gray-900 truncate">{{ employee.name }}</div>
          <div class="text-sm text-gray-600 truncate">{{ employee.title }}</div>
        </div>

        <!-- Level Badge -->
        <div
          draggable="false"
          class="shrink-0 px-2 py-1 rounded-full text-xs font-semibold"
          :class="
            level === 0
              ? 'bg-purple-100 text-purple-700'
              : level === 1
                ? 'bg-blue-100 text-blue-700'
                : level === 2
                  ? 'bg-green-100 text-green-700'
                  : level === 3
                    ? 'bg-yellow-100 text-yellow-700'
                    : level === 4
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-red-100 text-red-700'
          "
        >
          {{ getLevelLabel(level) }}
        </div>

        <!-- Subordinate Count Badge -->
        <div
          v-if="hasSubordinates"
          draggable="false"
          class="shrink-0 px-3 py-1 bg-brand-green/10 text-brand-green rounded-full text-sm font-semibold"
        >
          {{ subordinates.length }} {{ subordinates.length === 1 ? 'report' : 'reports' }}
        </div>

        <!-- Action Buttons -->
        <div class="shrink-0 flex gap-1">
          <button
            draggable="false"
            @click.stop="emit('edit', employee)"
            @mousedown.stop
            class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit employee"
          >
            <PencilIcon class="w-4 h-4" />
          </button>
          <button
            draggable="false"
            @click.stop="emit('addSubordinate', employee)"
            @mousedown.stop
            class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Add subordinate"
          >
            <PlusIcon class="w-4 h-4" />
          </button>
          <button
            v-if="!hasSubordinates"
            draggable="false"
            @click.stop="emit('delete', employee)"
            @mousedown.stop
            class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete employee"
          >
            <TrashIcon class="w-4 h-4" />
          </button>
          <div
            v-else
            draggable="false"
            class="p-2 text-gray-300 cursor-not-allowed rounded-lg relative group/delete"
            @click.stop
            @mousedown.stop
          >
            <TrashIcon class="w-4 h-4" />
            <div
              class="absolute bottom-full right-0 mb-2 hidden group-hover/delete:block w-48 z-50 pointer-events-none"
            >
              <div class="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                Cannot delete employee with {{ subordinates.length }} subordinate{{
                  subordinates.length === 1 ? '' : 's'
                }}
                <div
                  class="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Layout -->
      <div class="md:hidden p-3">
        <div class="flex items-start gap-3">
          <!-- Left: Drag Handle + Expand/Collapse -->
          <div class="flex flex-col items-center gap-2 pt-1">
            <div class="w-5 h-5 flex items-center justify-center text-gray-400">
              <Bars3Icon class="w-4 h-4" />
            </div>
            <button
              v-if="hasSubordinates"
              draggable="false"
              class="w-5 h-5 text-gray-400 hover:text-brand-green transition-colors"
              @click.stop="handleToggleExpand"
              @mousedown.stop
            >
              <ChevronDownIcon v-if="isExpanded" class="w-5 h-5" />
              <ChevronRightIcon v-else class="w-5 h-5" />
            </button>
          </div>

          <!-- Center: Avatar + Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2">
              <!-- Avatar -->
              <div
                draggable="false"
                class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs overflow-hidden"
                :class="[
                  !hasValidImage ? (level === 0 ? 'bg-brand-green' : 'bg-blue-500') : 'bg-gray-100',
                  hasSubordinates ? 'cursor-pointer' : '',
                ]"
                @click="hasSubordinates ? handleToggleExpand() : undefined"
              >
                <img
                  v-if="
                    employee.profile_image_url &&
                    employee.profile_image_url.startsWith('data:image') &&
                    !imageLoadError
                  "
                  :key="employee.profile_image_url"
                  :src="employee.profile_image_url"
                  :alt="employee.name"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
                <UserIcon
                  v-else-if="
                    employee.profile_image_url &&
                    !employee.profile_image_url.startsWith('data:image')
                  "
                  class="w-6 h-6 text-brand-green"
                />
                <span v-else>{{ getInitials(employee.name) }}</span>
              </div>

              <!-- Name + Title -->
              <div
                draggable="false"
                class="flex-1 min-w-0"
                :class="hasSubordinates ? 'cursor-pointer' : ''"
                @click="hasSubordinates ? handleToggleExpand() : undefined"
              >
                <div class="font-semibold text-gray-900 text-sm truncate">{{ employee.name }}</div>
                <div class="text-xs text-gray-600 truncate">{{ employee.title }}</div>
              </div>
            </div>

            <!-- Badges Row -->
            <div class="flex items-center gap-2 flex-wrap">
              <div
                class="px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="
                  level === 0
                    ? 'bg-purple-100 text-purple-700'
                    : level === 1
                      ? 'bg-blue-100 text-blue-700'
                      : level === 2
                        ? 'bg-green-100 text-green-700'
                        : level === 3
                          ? 'bg-yellow-100 text-yellow-700'
                          : level === 4
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                "
              >
                {{ getLevelLabel(level) }}
              </div>
              <div
                v-if="hasSubordinates"
                class="px-2 py-0.5 bg-brand-green/10 text-brand-green rounded-full text-xs font-semibold"
              >
                {{ subordinates.length }} {{ subordinates.length === 1 ? 'report' : 'reports' }}
              </div>
            </div>
          </div>

          <!-- Right: Action Buttons -->
          <div class="flex flex-col gap-1 pt-1">
            <button
              draggable="false"
              @click.stop="emit('edit', employee)"
              @mousedown.stop
              class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <PencilIcon class="w-4 h-4" />
            </button>
            <button
              draggable="false"
              @click.stop="emit('addSubordinate', employee)"
              @mousedown.stop
              class="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Add"
            >
              <PlusIcon class="w-4 h-4" />
            </button>
            <button
              v-if="!hasSubordinates"
              draggable="false"
              @click.stop="emit('delete', employee)"
              @mousedown.stop
              class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
            <div
              v-else
              draggable="false"
              class="p-1.5 text-gray-300 cursor-not-allowed rounded-lg"
              @click.stop
              @mousedown.stop
            >
              <TrashIcon class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Subordinates (Recursive) -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[5000px]"
      leave-from-class="opacity-100 max-h-[5000px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="isExpanded && hasSubordinates" class="mt-2 space-y-2">
        <EmployeeNode
          v-for="subordinate in subordinates"
          :key="`${subordinate.id}-${subordinate.profile_image_url?.substring(0, 20) || 'no-img'}`"
          :ref="
            (el) => {
              const index = subordinates.indexOf(subordinate)
              if (el) childRefs[index] = el
            }
          "
          :employee="subordinate"
          :all-employees="allEmployees"
          :search-query="searchQuery"
          :level="level + 1"
          :scroll-to-id="scrollToId"
          :drag-classes="dragClassesFn(subordinate)"
          :drag-classes-fn="dragClassesFn"
          :drop-zone-classes-fn="dropZoneClassesFn"
          @edit="(emp) => emit('edit', emp)"
          @add-subordinate="(emp) => emit('addSubordinate', emp)"
          @delete="(emp) => emit('delete', emp)"
          @drag-start="(emp, e) => emit('dragStart', emp, e)"
          @drag-end="emit('dragEnd')"
          @drag-over="(emp, e) => emit('dragOver', emp, e)"
          @drag-leave="emit('dragLeave')"
          @drop="(emp, e) => emit('drop', emp, e)"
          @drop-zone-drag-over="(zoneId, e) => emit('dropZoneDragOver', zoneId, e)"
          @drop-zone-drag-leave="emit('dropZoneDragLeave')"
          @drop-zone-drop="(targetId, e) => emit('dropZoneDrop', targetId, e)"
          @expand="handleChildExpand"
        />
      </div>
    </Transition>
  </div>
</template>
