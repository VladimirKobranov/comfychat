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

  // GET ALL NOTES
  async function getNotes() {
    const { data } = await supabase.from('notes').select('*')
    if (data) notes.value = data
  }

  // CREATE NOTE
  async function createNote(content: string) {
    const auth = useAuthStore()
    const { data } = await supabase.from('notes').insert({ content, user: auth.user?.id }).select()
    if (data) notes.value = [...notes.value, ...data]
  }

  // DELETE NOTE
  async function deleteNote(note_id: Note['id']) {
    await supabase.from('notes').delete().eq('id', note_id)
    notes.value = notes.value.filter((n) => n.id !== note_id)
  }

  // UPDATE NOTE
  async function updateNote(note_id: Note['id'], content: string) {
    const { data } = await supabase.from('notes').update({ content }).eq('id', note_id).select()
    if (data) {
      const i = notes.value.findIndex((n) => n.id === note_id)
      if (i !== -1) notes.value[i] = data[0]
    }
  }
  return { notes, getNotes, createNote, deleteNote, updateNote }
})
