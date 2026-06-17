// stores/index.ts
import { useAppStore } from './app'
import { useAuthStore } from './auth'

export function useStores() {
  return {
    app: useAppStore(),
    auth: useAuthStore(),
  }
}
