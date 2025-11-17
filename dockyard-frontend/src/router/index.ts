import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/features/employees/views/LandingView.vue'),
    },
    {
      path: '/hierarchy',
      name: 'hierarchy',
      component: () => import('@/features/employees/views/EmployeeHierarchyView.vue'),
    },
  ],
})

export default router
