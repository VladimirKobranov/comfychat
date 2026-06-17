<script setup lang="ts">
import { ref } from 'vue'
import { useComfyStore } from '@/stores/comfy'
import { comfyDefaults } from '@/configs/comfy'

const comfy = useComfyStore()

const positive = ref(comfyDefaults.positive)
const negative = ref(comfyDefaults.negative)
const steps = ref(comfyDefaults.steps)
const cfg = ref(comfyDefaults.cfg)
const denoise = ref(comfyDefaults.denoise)
const width = ref(comfyDefaults.width)
const height = ref(comfyDefaults.height)
const seed = ref<number | null>(null)
const samplerName = ref(comfyDefaults.sampler_name)
const scheduler = ref(comfyDefaults.scheduler)

function handleGenerate() {
  comfy.generate({
    positive: positive.value,
    negative: negative.value,
    steps: steps.value,
    cfg: cfg.value,
    denoise: denoise.value,
    width: width.value,
    height: height.value,
    seed: seed.value ?? undefined,
    sampler_name: samplerName.value,
    scheduler: scheduler.value,
  })
}

function download(url: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = ''
  a.click()
}

function openImage() {
  window.open(comfy.imageUrl, '_blank')
}
</script>

<template>
  <div>
    <textarea v-model="positive" placeholder="Positive prompt" rows="3" />
    <textarea v-model="negative" placeholder="Negative prompt" rows="2" />

    <div class="params">
      <label>Steps <input v-model.number="steps" type="number" min="1" max="150" /></label>
      <label>CFG <input v-model.number="cfg" type="number" min="1" max="30" step="0.5" /></label>
      <label
        >Denoise <input v-model.number="denoise" type="number" min="0" max="1" step="0.05"
      /></label>
      <label
        >Width <input v-model.number="width" type="number" min="64" max="2048" step="64"
      /></label>
      <label
        >Height <input v-model.number="height" type="number" min="64" max="2048" step="64"
      /></label>
      <label>Seed <input v-model.number="seed" type="number" placeholder="random" /></label>
      <label>
        Sampler
        <select v-model="samplerName">
          <option>euler</option>
          <option>euler_ancestral</option>
          <option>heun</option>
          <option>dpmpp_2m</option>
          <option>dpmpp_2s_ancestral</option>
          <option>lcm</option>
        </select>
      </label>
      <label>
        Scheduler
        <select v-model="scheduler">
          <option>normal</option>
          <option>karras</option>
          <option>exponential</option>
          <option>sgm_uniform</option>
          <option>simple</option>
        </select>
      </label>
    </div>

    <div>
      <button
        :disabled="comfy.status === 'generating' || comfy.status === 'queued'"
        @click="handleGenerate"
      >
        {{
          comfy.status === 'generating' || comfy.status === 'queued' ? 'Generating...' : 'Generate'
        }}
      </button>
    </div>

    <p v-if="comfy.status === 'queued' || comfy.status === 'generating'">
      Progress: {{ comfy.progress }}%
    </p>

    <p v-if="comfy.error" class="error">{{ comfy.error }}</p>

    <div v-if="comfy.imageUrl" class="result">
      <img :src="comfy.imageUrl" alt="generated" />
      <div class="actions">
        <button @click="openImage">Open full size</button>
        <button @click="download(comfy.imageUrl)">Download</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error {
  color: #e00;
}
textarea {
  display: block;
  width: 400px;
  margin-bottom: 8px;
}
img {
  max-width: 512px;
  margin-top: 12px;
}
.params {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0;
  label {
    font-size: 0.85em;
  }
  input,
  select {
    display: block;
    margin-top: 2px;
    width: 110px;
  }
}
</style>
