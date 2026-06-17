import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import router from '@/router'

interface user {
  name: string
  email: string
  token: string
  role: string
  _id: number
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<user | null>(null)

  const isAuthenticated = computed(() => user.value !== null)

  async function login(email: string, password: string) {
    console.log('::auth:: ', email, password)
    await new Promise((resolve) => setTimeout(resolve, 500))

    user.value = {
      name: 'John Doe',
      email: email,
      token: 'fake-token-' + Math.random().toString(36),
      role: 'user',
      _id: 1,
    }
  }

  async function logout() {
    user.value = null
    await router.push('/')
  }

  return { user, isAuthenticated, login, logout }
})
