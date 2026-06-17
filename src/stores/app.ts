import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const count = ref(1)
  const doubleCount = computed(() => count.value * 2)

  function init() {
    console.log('::app::init::')
  }

  function sum(a: number, b: number) {
    return a + b
  }

  return { count, doubleCount, init, sum }
})
