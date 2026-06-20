import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useNotesStore } from '@/stores/notes'

const SYSTEM_PROMPT = `You are a prompt engineering assistant for Stable Diffusion ComfyUI.

Enhance short user descriptions into detailed SD prompts.

Respond ONLY in JSON format without markdown formatting, without explanations:
{
  "positivePrompt": "masterpiece, best quality, ...",
  "negativePrompt": "lowres, bad anatomy, ...",
  "parameters": {
    "steps": 20,
    "cfg": 7
  }
}

Prompts must be in English, even if the user writes in Russian or any other language.
Use SD keywords: masterpiece, cinematic lighting, intricate details.
Select steps/cfg based on style (photorealism — low cfg, art — high cfg).`

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  positivePrompt?: string
  negativePrompt?: string
  parameters?: { steps?: number; cfg?: number }
}

interface LlamaChoice {
  message: { content: string }
}

interface LlamaResponse {
  positivePrompt: string
  negativePrompt: string
  parameters?: { steps?: number; cfg?: number }
}

const HISTORY_KEY = 'chat_history'
const APPLY_KEY = 'chat_prompts'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const loading = ref(false)
  const error = ref('')
  let errorTimer: ReturnType<typeof setTimeout> | null = null

  function setError(msg: string) {
    if (errorTimer) clearTimeout(errorTimer)
    error.value = msg
    if (msg) {
      errorTimer = setTimeout(() => {
        error.value = ''
      }, 5000)
    }
  }

  function loadHistory() {
    const saved = localStorage.getItem(HISTORY_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatMessage[]
        if (Array.isArray(parsed)) messages.value = parsed
      } catch {
        /* ignore */
      }
    }
  }

  function saveHistory() {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.value))
  }

  async function send(text: string) {
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text }
    messages.value.push(userMsg)
    saveHistory()

    loading.value = true
    setError('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.value.map((m) => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })

      if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(`LLM error ${res.status}: ${body}`)
      }

      const data: { choices?: LlamaChoice[] } = await res.json()
      const choice = data.choices?.[0]
      if (!choice?.message?.content) {
        throw new Error(`Empty response from LLM:\n${JSON.stringify(data)}`)
      }
      const rawContent = choice.message.content

      let parsed: LlamaResponse
      try {
        parsed = JSON.parse(rawContent) as LlamaResponse
      } catch {
        throw new Error(`Invalid JSON from LLM:\n${rawContent}`)
      }

      if (!parsed.positivePrompt || !parsed.negativePrompt) {
        throw new Error(`Missing fields in LLM response:\n${rawContent}`)
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: rawContent,
        positivePrompt: parsed.positivePrompt,
        negativePrompt: parsed.negativePrompt,
        parameters: parsed.parameters,
      }
      messages.value.push(assistantMsg)
      saveHistory()

      useNotesStore()
        .createNote(text)
        .catch(() => {})
    } catch (e) {
      setError((e as Error).message)
    } finally {
      loading.value = false
    }
  }

  function applyPrompts(msg: ChatMessage) {
    localStorage.setItem(
      APPLY_KEY,
      JSON.stringify({
        positivePrompt: msg.positivePrompt,
        negativePrompt: msg.negativePrompt,
        parameters: msg.parameters,
      }),
    )
  }

  function clearHistory() {
    messages.value = []
    localStorage.removeItem(HISTORY_KEY)
  }

  return { messages, loading, error, send, applyPrompts, loadHistory, clearHistory, setError }
})
