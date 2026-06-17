import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'

export interface Generation {
  id: number
  created_at: string
  user_id: string
  model: string
  positive: string
  negative: string
  width: number
  height: number
  batch_size: number
  steps: number
  cfg: number
  sampler_name: string
  scheduler: string
  denoise: number
  seed: number | null
  status: 'pending' | 'completed' | 'failed'
  prompt_id: string | null
  image_filename: string | null
  image_subfolder: string | null
  error: string | null
}

export const useGenerationsStore = defineStore('generations', () => {
  const generations = ref<Generation[]>([])

  async function getGenerations() {
    const { data } = await supabase
      .from('generations')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) generations.value = data
  }

  async function deleteGeneration(id: Generation['id']) {
    await supabase.from('generations').delete().eq('id', id)
    generations.value = generations.value.filter((g) => g.id !== id)
  }

  return { generations, getGenerations, deleteGeneration }
})
