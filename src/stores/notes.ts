import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/stores/auth'

export interface Note {
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

  async function createNote(content: string) {
    const auth = useAuthStore()
    const { data } = await supabase.from('notes').insert({ content, user: auth.user?.id }).select()
    if (data) notes.value = [...notes.value, ...data]
  }

  async function deleteNote(note_id: Note['id']) {
    await supabase.from('notes').delete().eq('id', note_id)
    notes.value = notes.value.filter((n) => n.id !== note_id)
  }
  return { notes, getNotes, createNote, deleteNote }
})
