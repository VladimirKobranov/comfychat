import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'
import type { User } from '@supabase/supabase-js'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<Pick<
    User,
    | 'id'
    | 'email'
    | 'user_metadata'
    | 'app_metadata'
    | 'created_at'
    | 'last_sign_in_at'
    | 'email_confirmed_at'
  > | null>(null)
  const ready = ref(false)
  const isRecoverySession = ref(false)

  const isAuthenticated = computed(() => user.value !== null)

  let authListener: { subscription: { unsubscribe: () => void } } | null = null

  async function init() {
    if (ready.value) return
    const {
      data: { session },
    } = await supabase.auth.getSession()
    syncUser(session?.user ?? null)
    ready.value = true

    authListener = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        isRecoverySession.value = true
      }
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
        email_confirmed_at: supabaseUser.email_confirmed_at,
      }
    } else {
      user.value = null
    }
  }

  async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.session?.user) syncUser(data.session.user)
  }

  async function updateProfile(metadata: Record<string, string>) {
    const { data: result, error } = await supabase.auth.updateUser({ data: metadata })
    if (error) throw error
    if (result.user) syncUser(result.user)
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
    if (error) throw error
  }

  async function updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
    isRecoverySession.value = false
  }

  async function logout() {
    isRecoverySession.value = false
    await supabase.auth.signOut()
    authListener?.subscription.unsubscribe()
    await router.push('/')
  }

  function cleanup() {
    authListener?.subscription.unsubscribe()
  }

  return {
    user,
    isAuthenticated,
    isRecoverySession,
    ready,
    init,
    login,
    resetPassword,
    updatePassword,
    updateProfile,
    logout,
    cleanup,
  }
})
