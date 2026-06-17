<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'

const router = useRouter()

const data = ref({
  email: '',
  password: '',
  confirm: '',
})

const error = ref('')
const loading = ref(false)
const success = ref(false)

async function handleSignup() {
  error.value = ''
  if (data.value.password !== data.value.confirm) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true
  try {
    const { error: err } = await supabase.auth.signUp({
      email: data.value.email,
      password: data.value.password,
    })
    if (err) throw err
    success.value = true
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'Signup failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form v-if="!success" class="form" @submit.prevent="handleSignup">
    <h4>Sign up</h4>
    <p v-if="error" class="error">{{ error }}</p>
    <input v-model="data.email" type="email" placeholder="Email" required />
    <input v-model="data.password" type="password" placeholder="Password" required />
    <input v-model="data.confirm" type="password" placeholder="Confirm password" required />
    <button :disabled="loading">{{ loading ? 'Signing up...' : 'Sign up' }}</button>
    <p>
      Already have an account?
      <RouterLink to="/login">Log in</RouterLink>
    </p>
  </form>

  <div v-else class="form">
    <h4>Check your email</h4>
    <p>
      We sent a confirmation link to <strong>{{ data.email }}</strong
      >.
    </p>
    <RouterLink to="/login">Go to login</RouterLink>
  </div>
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
