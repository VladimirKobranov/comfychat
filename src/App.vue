<script setup lang="ts">
import '@/styles/style.scss'
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
  <div class="main">
    <NavigationPanelComponent />
    <RouterView />
  </div>
</template>

<style lang="scss">
#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 100dvh;
}
body {
  margin: 0;
}

.main {
  margin: 20px;
}
</style>
