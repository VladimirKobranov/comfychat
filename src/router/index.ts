import HomePage from '@/pages/HomePage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import ProfilePage from '@/pages/dashboard/ProfilePage.vue'
import SignupPage from '@/pages/SignupPage.vue'
import ComfyPage from '@/pages/dashboard/ComfyPage.vue'
import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '@/pages/dashboard/DashboardPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomePage,
    },
    {
      path: '/login',
      component: LoginPage,
    },
    {
      path: '/signup',
      component: SignupPage,
    },
    {
      path: '/dashboard',
      meta: { requiresAuth: true },
      children: [
        { path: 'profile', component: ProfilePage },
        { path: 'comfy', component: ComfyPage },
        { path: '', component: DashboardPage },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.ready) {
      await auth.init()
    }
    if (!auth.isAuthenticated) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  }
})

export default router
