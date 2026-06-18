import HomePage from '@/pages/HomePage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import NotesPage from '@/pages/dashboard/NotesPage.vue'
import ProfilePage from '@/pages/dashboard/ProfilePage.vue'
import SignupPage from '@/pages/SignupPage.vue'
import ChatPage from '@/pages/dashboard/ChatPage.vue'
import ComfyPage from '@/pages/dashboard/ComfyPage.vue'
import GenerationsPage from '@/pages/dashboard/GenerationsPage.vue'
import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'

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
        { path: 'notes', component: NotesPage },
        { path: 'profile', component: ProfilePage },
        { path: 'chat', component: ChatPage },
        { path: 'comfy', component: ComfyPage },
        { path: 'generations', component: GenerationsPage },
        { path: '', redirect: 'notes' },
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
