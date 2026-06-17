<script setup lang="ts">
import router from '@/router'

defineProps<{
  to: string
  text: string
}>()

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <button @click="navigate(to)">
    {{ text }}
  </button>
</template>

<style scoped lang="scss"></style>
