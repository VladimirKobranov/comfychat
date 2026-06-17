<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStores } from '@/stores'
const { auth } = useStores()
const route = useRoute()
const router = useRouter()

interface FormData {
  email: string
  password: string
}

const data = ref<FormData>({
  email: '',
  password: '',
})

const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(data.value.email, data.value.password)
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="form" @submit.prevent="handleLogin">
    <h4>Sign in</h4>
    <p v-if="error" class="error">{{ error }}</p>
    <input v-model="data.email" type="email" placeholder="Email" required />
    <input v-model="data.password" type="password" placeholder="Password" required />
    <button :disabled="loading">{{ loading ? 'Logging in...' : 'Login' }}</button>
    <p>Don't have an account? <RouterLink to="/signup">Sign up</RouterLink></p>
  </form>
</template>

<style lang="scss">
@use '@/styles/mixins';

.form {
  @extend %gap, %column-layout;
}

.error {
  color: #e00;
  margin: 0;
}
</style>
