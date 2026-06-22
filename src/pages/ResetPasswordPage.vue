<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const email = ref('')
const sent = ref(false)
const loading = ref(false)
const error = ref('')

async function handleReset() {
  error.value = ''
  loading.value = true
  try {
    await auth.resetPassword(email.value)
    sent.value = true
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'Failed to send reset email'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page page-center">
    <form v-if="!sent" class="form" @submit.prevent="handleReset">
      <h4>Reset password</h4>
      <p v-if="error" class="error">{{ error }}</p>
      <input v-model="email" type="email" placeholder="Your email" required />
      <button type="submit" :disabled="loading">
        {{ loading ? 'Sending...' : 'Send reset link' }}
      </button>
      <p><RouterLink to="/login">Back to login</RouterLink></p>
    </form>
    <div v-else class="form">
      <h4>Check your email</h4>
      <p>
        We sent a password reset link to <strong>{{ email }}</strong
        >.
      </p>
      <RouterLink to="/login">Back to login</RouterLink>
    </div>
  </div>
</template>

<style lang="scss"></style>
