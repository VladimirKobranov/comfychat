import { useAppStore } from './app'
import { useAuthStore } from './auth'
import { useChatStore } from './chat'
import { useNotesStore } from './notes'

export function useStores() {
  return {
    app: useAppStore(),
    auth: useAuthStore(),
    chat: useChatStore(),
    notes: useNotesStore(),
  }
}
