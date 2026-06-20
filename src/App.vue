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
html,
body {
  height: 100%;
  margin: 0;
}

#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100dvh;
}

.main {
  margin: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
