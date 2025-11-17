# Dockyard Frontend

Employee hierarchy management system built with Vue 3, TypeScript, and Pinia.

## Installation

### Prerequisites
- Node.js 20.19.0 or 22.12.0+
- npm 10.x or higher

### Install dependencies

```bash
npm install
```

## Running the project

### Development

```bash
npm run dev
```

Application available at http://localhost:5173

### Production build

```bash
npm run build
npm run preview
```

### Code quality

```bash
npm run lint      # ESLint with auto-fix
npm run format    # Prettier
npm run type-check # TypeScript type checking
```

## Tech Stack

- Vue 3.5.22
- TypeScript 5.9
- Vite 7.1
- Pinia 3.0
- Vue Router 4.6
- Tailwind CSS 4.1
- Axios 1.13
- @heroicons/vue 2.2
- lucide-vue-next 0.553

## Project structure

```
src/
├── App.vue
├── main.ts
├── assets/
│   └── main.css
├── features/
│   └── employees/
│       ├── components/
│       │   ├── EmployeeDeleteDialog.vue
│       │   ├── EmployeeForm.vue
│       │   ├── EmployeeNode.vue
│       │   └── EmployeeTree.vue
│       ├── composables/
│       │   ├── useDragAndDrop.ts
│       │   ├── useEmployeeFormat.ts
│       │   ├── useEmployeeFormValidation.ts
│       │   ├── useEmployeeHighlight.ts
│       │   ├── useEmployeeImage.ts
│       │   ├── useEmployeeImageUpload.ts
│       │   ├── useEmployeeManagerFilter.ts
│       │   └── useEmployeeTree.ts
│       ├── types/
│       │   └── employee.types.ts
│       ├── views/
│       │   ├── EmployeeHierarchyView.vue
│       │   └── LandingView.vue
│       └── employee-api.service.ts
├── layouts/
│   └── DefaultLayout.vue
├── router/
│   └── index.ts
├── shared/
│   ├── components/
│   │   ├── BackgroundCarousel.vue
│   │   ├── feedback/
│   │   │   └── ToastContainer.vue
│   │   ├── layout/
│   │   │   ├── AppFooter.vue
│   │   │   └── AppHeader.vue
│   │   └── ui/
│   │       ├── BaseDialog.vue
│   │       ├── Container.vue
│   │       ├── CustomSelect.vue
│   │       ├── FeatureCard.vue
│   │       └── StatCard.vue
│   ├── composables/
│   │   ├── useDebouncedRef.ts
│   │   ├── useDialog.ts
│   │   ├── useImageCarousel.ts
│   │   └── useToast.ts
│   ├── config/
│   │   └── index.ts
│   ├── services/
│   │   ├── base-api.service.ts
│   │   └── http.service.ts
│   └── types/
│       └── api.types.ts
└── stores/
    ├── employee.store.ts
    ├── index.ts
    └── ui.store.ts
```

## Features

### Hierarchical listing
- Employee tree with visual levels (Tier 1, Tier 2, etc)
- Expand/collapse subordinates
- Card with photo/initials, name, title, and local time

### Search
- Real-time search with debounce (300ms)
- Server-side filtering for performance
- Results panel with auto-scroll and highlight

### Drag & Drop
- Native HTML5 Drag and Drop API
- Cycle detection (can't drop on own subordinate)
- Visual feedback with valid/invalid drop zones
- Moves employee + entire hierarchy

### Image management
- Upload with base64 conversion
- Invalid path handling (`/img/uuid.png`)
- Fallback to initials when no photo
- Size (max 5MB) and format (PNG, JPG, GIF) validation

### Full CRUD
- Create employee
- Edit employee
- Delete employee (with subordinate validation)
- Add direct subordinate
- Real-time form validation

### Global state
- **employee.store**: Employee list, CRUD, search, hierarchy updates
- **ui.store**: Toast notifications (success, error, warning, info)

### Design
- Responsive design
- Loadsmart brand colors
- Smooth animations
- Loading and empty states
