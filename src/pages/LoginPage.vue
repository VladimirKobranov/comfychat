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

function handleLogin() {
  auth.login(data.value.email, data.value.password)
  const redirect = (route.query.redirect as string) || '/'
  router.push(redirect)
}
</script>

<template>
  <form class="form">
    <h4>Form:</h4>
    <input v-model="data.email" type="email" />
    <input v-model="data.password" type="password" />
  </form>

  <div>
    <button @click="handleLogin">login</button>
  </div>
</template>

<style lang="scss">
@use '@/styles/mixins';

.form {
  @extend %gap, %column-layout;
}
</style>
