import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/stores/auth'
import { useGenerationsStore } from '@/stores/generations'
import { comfyDefaults } from '@/configs/comfy'

const COMFY_HOST = 'http://127.0.0.1:8188'

export const useComfyStore = defineStore('comfy', () => {
  const status = ref<'idle' | 'queued' | 'generating' | 'done' | 'error'>('idle')
  const progress = ref(0)
  const imageUrl = ref('')
  const error = ref('')

  let ws: WebSocket | null = null

  async function generate({
    positive,
    negative,
    model = comfyDefaults.model,
    width = comfyDefaults.width,
    height = comfyDefaults.height,
    batch_size = comfyDefaults.batch_size,
    steps = comfyDefaults.steps,
    cfg = comfyDefaults.cfg,
    sampler_name = comfyDefaults.sampler_name,
    scheduler = comfyDefaults.scheduler,
    denoise = comfyDefaults.denoise,
    seed,
  }: {
    positive: string
    negative: string
    model?: string
    width?: number
    height?: number
    batch_size?: number
    steps?: number
    cfg?: number
    sampler_name?: string
    scheduler?: string
    denoise?: number
    seed?: number
  }) {
    if (status.value === 'generating' || status.value === 'queued') return

    progress.value = 0
    imageUrl.value = ''
    error.value = ''

    const auth = useAuthStore()
    const userId = auth.user?.id
    if (!userId) {
      error.value = 'Not authenticated'
      status.value = 'error'
      return
    }

    const clientId = crypto.randomUUID()
    const finalSeed = seed ?? Math.floor(Math.random() * 2 ** 32)

    const workflow = {
      prompt: {
        '4': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: model } },
        '5': { class_type: 'EmptyLatentImage', inputs: { batch_size, height, width } },
        '6': { class_type: 'CLIPTextEncode', inputs: { clip: ['4', 1], text: positive } },
        '7': { class_type: 'CLIPTextEncode', inputs: { clip: ['4', 1], text: negative } },
        '3': {
          class_type: 'KSampler',
          inputs: {
            seed: finalSeed,
            steps,
            cfg,
            sampler_name,
            scheduler,
            denoise,
            model: ['4', 0],
            positive: ['6', 0],
            negative: ['7', 0],
            latent_image: ['5', 0],
          },
        },
        '8': { class_type: 'VAEDecode', inputs: { samples: ['3', 0], vae: ['4', 2] } },
        '9': { class_type: 'SaveImage', inputs: { filename_prefix: 'myimage', images: ['8', 0] } },
      },
      client_id: clientId,
    }

    try {
      status.value = 'queued'
      const res = await fetch(`${COMFY_HOST}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow),
      })
      const { prompt_id } = (await res.json()) as { prompt_id: string }
      status.value = 'generating'
      connectWs(clientId, prompt_id)

      await supabase.from('generations').insert({
        user_id: userId,
        model,
        positive,
        negative,
        width,
        height,
        batch_size,
        steps,
        cfg,
        sampler_name,
        scheduler,
        denoise,
        seed: finalSeed,
        status: 'pending',
        prompt_id,
      })
    } catch (e) {
      error.value = (e as Error).message
      status.value = 'error'

      await supabase.from('generations').insert({
        user_id: userId,
        model,
        positive,
        negative,
        width,
        height,
        batch_size,
        steps,
        cfg,
        sampler_name,
        scheduler,
        denoise,
        seed: finalSeed ?? null,
        status: 'failed',
        error: error.value,
      })
    }
  }

  async function saveSuccess(promptId: string, filename: string, subfolder: string) {
    const auth = useAuthStore()
    const userId = auth.user?.id

    const { data } = await supabase
      .from('generations')
      .update({
        status: 'completed',
        image_filename: filename,
        image_subfolder: subfolder,
      })
      .eq('prompt_id', promptId)
      .select()

    if (userId) {
      try {
        const blobRes = await fetch(
          `${COMFY_HOST}/view?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder)}&type=output`,
        )
        const blob = await blobRes.blob()
        const path = `${userId}/${filename}`
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(path, blob, { upsert: true })
        if (!uploadError) {
          const { data: signed } = await supabase.storage
            .from('images')
            .createSignedUrl(path, 60 * 60 * 24 * 365)
          if (signed?.signedUrl) {
            await supabase
              .from('generations')
              .update({ image_storage_path: signed.signedUrl })
              .eq('prompt_id', promptId)
          }
        }
      } catch {
        // fail silently — image_filename already saved, ComfyUI URL works as fallback
      }
    }

    if (data?.length) {
      const gens = useGenerationsStore()
      const i = gens.generations.findIndex((g) => g.prompt_id === promptId)
      if (i !== -1) gens.generations[i] = { ...gens.generations[i], ...data[0] }
    }
  }

  async function saveFail(promptId: string, msg: string) {
    await supabase
      .from('generations')
      .update({
        status: 'failed',
        error: msg,
      })
      .eq('prompt_id', promptId)
  }

  function connectWs(clientId: string, promptId: string) {
    ws = new WebSocket(`ws://127.0.0.1:8188/ws?clientId=${clientId}`)

    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data) as {
        type: string
        data: {
          prompt_id?: string
          node: string | null
          value: number
          max: number
          output?: { images: Array<{ filename: string; subfolder: string; type: string }> }
        }
      }

      if (data.prompt_id !== promptId) return

      switch (type) {
        case 'progress':
          progress.value = data.max ? Math.round((data.value / data.max) * 100) : 0
          break
        case 'executing':
          if (data.node === null) {
            status.value = 'done'
          }
          break
        case 'executed': {
          const img = data.output?.images?.[0]
          if (img) {
            imageUrl.value = `${COMFY_HOST}/view?filename=${encodeURIComponent(img.filename)}&subfolder=${encodeURIComponent(img.subfolder)}&type=${img.type}`
            void saveSuccess(promptId, img.filename, img.subfolder)
          }
          status.value = 'done'
          break
        }
      }
    }

    ws.onerror = () => {
      error.value = 'WebSocket error'
      status.value = 'error'
      void saveFail(promptId, 'WebSocket error')
    }

    ws.onclose = () => {
      ws = null
    }
  }

  function reset() {
    ws?.close()
    status.value = 'idle'
    progress.value = 0
    imageUrl.value = ''
    error.value = ''
  }

  return { status, progress, imageUrl, error, generate, reset }
})
