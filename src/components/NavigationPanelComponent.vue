<script setup lang="ts">
import { useStores } from '@/stores'
import ButtonLink from './ButtonLink.vue'

const { auth } = useStores()

const handleLogout = () => {
  auth.logout()
}
</script>

<template>
  <div class="panel">
    <ButtonLink to="/" text="Home" />
    <ButtonLink v-if="!auth.isAuthenticated" to="/login" text="Login" />
    <ButtonLink v-if="auth.isAuthenticated" to="/dashboard/notes" text="Notes" />
    <ButtonLink v-if="auth.isAuthenticated" to="/dashboard/chat" text="Chat" />
    <ButtonLink v-if="auth.isAuthenticated" to="/dashboard/comfy" text="Comfy" />
    <ButtonLink v-if="auth.isAuthenticated" to="/dashboard/generations" text="Generations" />
    <ButtonLink v-if="auth.isAuthenticated" to="/dashboard/profile" text="Profile" />
    <button v-if="auth.isAuthenticated" @click="handleLogout">Logout</button>
  </div>
</template>

<style lang="scss">
@use '@/styles/mixins';

.panel {
  @extend %row-layout;
  @extend %gap;
  align-items: center;
  justify-content: center;
}
</style>
