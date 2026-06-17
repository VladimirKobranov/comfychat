import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  function init() {
    console.log('::app::init::')
  }

  return { init }
})
