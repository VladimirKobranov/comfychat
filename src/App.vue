<script setup lang="ts">
import { onMounted } from 'vue'
import { useStores } from '@/stores'
import NavigationPanelComponent from './components/NavigationPanelComponent.vue'

const { app } = useStores()

onMounted(() => {
  app.init()
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
  justify-content: center;
  min-height: 100dvh;
}
body {
  margin: 0;
}
</style>
