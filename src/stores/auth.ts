import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<Pick<
    User,
    'id' | 'email' | 'user_metadata' | 'app_metadata' | 'created_at' | 'last_sign_in_at'
  > | null>(null)
  const ready = ref(false)

  const isAuthenticated = computed(() => user.value !== null)

  let authListener: { subscription: { unsubscribe: () => void } } | null = null

  async function init() {
    if (ready.value) return
    const {
      data: { session },
    } = await supabase.auth.getSession()
    syncUser(session?.user ?? null)
    ready.value = true

    authListener = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session?.user ?? null)
    }).data
  }

  function syncUser(supabaseUser: User | null) {
    if (supabaseUser) {
      user.value = {
        id: supabaseUser.id,
        email: supabaseUser.email ?? '',
        user_metadata: supabaseUser.user_metadata,
        app_metadata: supabaseUser.app_metadata,
        created_at: supabaseUser.created_at,
        last_sign_in_at: supabaseUser.last_sign_in_at,
      }
    } else {
      user.value = null
    }
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function updateProfile(metadata: Record<string, string>) {
    const { data: result, error } = await supabase.auth.updateUser({ data: metadata })
    if (error) throw error
    if (result.user) syncUser(result.user)
  }

  async function logout() {
    await supabase.auth.signOut()
    authListener?.subscription.unsubscribe()
  }

  function cleanup() {
    authListener?.subscription.unsubscribe()
  }

  return { user, isAuthenticated, ready, init, login, updateProfile, logout, cleanup }
})
