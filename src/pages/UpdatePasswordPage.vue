<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const password = ref('')
const confirm = ref('')
const loading = ref(false)
const error = ref('')
const done = ref(false)

onMounted(async () => {
  if (!auth.ready) await auth.init()

  let retries = 0
  while (!auth.isAuthenticated && retries < 15) {
    await new Promise((r) => setTimeout(r, 300))
    retries++
  }

  if (!auth.isAuthenticated) {
    router.replace('/login')
  }
})

async function handleUpdate() {
  if (password.value !== confirm.value) {
    error.value = 'Passwords do not match'
    return
  }
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await auth.updatePassword(password.value)
    done.value = true
    setTimeout(() => router.push('/dashboard'), 2000)
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'Failed to update password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <form v-if="!done" class="form" @submit.prevent="handleUpdate">
      <h4>Set new password</h4>
      <p v-if="error" class="error">{{ error }}</p>
      <input v-model="password" type="password" placeholder="New password" minlength="6" required />
      <input v-model="confirm" type="password" placeholder="Confirm new password" required />
      <button type="submit" :disabled="loading">
        {{ loading ? 'Updating...' : 'Update password' }}
      </button>
    </form>
    <div v-else class="form">
      <h4>Password updated</h4>
      <p>Redirecting to dashboard...</p>
      <RouterLink to="/dashboard">Go to dashboard</RouterLink>
    </div>
  </div>
</template>

<style lang="scss"></style>
