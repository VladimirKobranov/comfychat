<script setup lang="ts">
import { useStores } from '@/stores'
import { formatDate } from '@/utils/utils'

const { auth } = useStores()
</script>

<template>
  <h4>Profile</h4>
  <div>id: {{ auth.user?.id }}</div>
  <div>email: {{ auth.user?.email }}</div>
  <div v-if="auth.user?.created_at">registered: {{ formatDate(auth.user.created_at) }}</div>
  <div v-if="auth.user?.last_sign_in_at">
    last login: {{ formatDate(auth.user.last_sign_in_at) }}
  </div>
</template>
