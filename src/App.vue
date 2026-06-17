<script setup lang="ts">
import { onMounted } from 'vue'
import { useStores } from '@/stores'
import NavigationPanelComponent from './components/NavigationPanelComponent.vue'

const { app, auth } = useStores()

onMounted(() => {
  app.init()
  auth.init()
})
</script>

<template>
  <NavigationPanelComponent />
  <RouterView />
</template>

<style lang="scss">
#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100dvh;
}
body {
  margin: 0;
}
</style>
