<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore, type ChatMessage } from '@/stores/chat'

const chat = useChatStore()
const router = useRouter()
const input = ref('')

onMounted(() => {
  chat.loadHistory()
})

function handleSend() {
  const text = input.value.trim()
  if (!text || chat.loading) return
  input.value = ''
  chat.send(text)
}

function handleApply(msg: ChatMessage) {
  chat.applyPrompts(msg)
  router.push('/dashboard/comfy')
}

function copy(text: string) {
  navigator.clipboard.writeText(text)
}
</script>

<template>
  <div>
    <h2>Prompt Assistant</h2>
    <button @click="chat.clearHistory">Clear history</button>
    <hr />

    <div>
      <div v-for="msg in chat.messages" :key="msg.id">
        <p v-if="msg.role === 'user'">
          <strong>You:</strong>
        </p>
        <pre v-if="msg.role === 'user'" class="prompt-text">{{ msg.content }}</pre>

        <template v-if="msg.role === 'assistant'">
          <p><strong>Assistant:</strong></p>
          <label v-if="msg.positivePrompt">
            Positive Prompt
            <textarea
              :value="msg.positivePrompt"
              rows="10"
              readonly
              class="prompt-textarea"
            ></textarea>
          </label>
          <label v-if="msg.negativePrompt">
            Negative Prompt
            <textarea
              :value="msg.negativePrompt"
              rows="10"
              readonly
              class="prompt-textarea"
            ></textarea>
          </label>
          <p v-if="msg.parameters">
            Steps: {{ msg.parameters.steps }} | CFG: {{ msg.parameters.cfg }}
          </p>
          <div class="panel">
            <button @click="handleApply(msg)">Apply to ComfyUI</button>
            <button @click="copy(msg.positivePrompt ?? '')">Copy positive</button>
            <button @click="copy(msg.negativePrompt ?? '')">Copy negative</button>
          </div>
        </template>
        <hr />
      </div>
    </div>

    <p v-if="chat.error" class="error">{{ chat.error }}</p>

    <form @submit.prevent="handleSend">
      <textarea
        v-model="input"
        placeholder="Describe what you want to generate..."
        rows="4"
        :disabled="chat.loading"
        class="full-width"
      ></textarea>
      <br />
      <button type="submit" :disabled="chat.loading || !input.trim()">
        {{ chat.loading ? 'Thinking...' : 'Send' }}
      </button>
    </form>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins';

.prompt-textarea {
  display: flex;
  min-width: 400px;
  width: 100%;
  margin: 6px;
}

.full-width {
  width: 100%;
  box-sizing: border-box;
}

.error {
  color: red;
}
</style>
