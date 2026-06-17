import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'

interface Note {
  id: number
  created_at: string
  content: string | null
  user: string | null
}

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])

  async function getNotes() {
    const { data } = await supabase.from('notes').select('*')
    if (data) notes.value = data
  }

  return { notes, getNotes }
})
