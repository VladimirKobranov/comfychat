<script setup lang="ts">
import { watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useStores } from '@/stores'
import { useGenerationsStore } from '@/stores/generations'
import { formatDate } from '@/utils/utils'

import type { Generation } from '@/stores/generations'

const { auth } = useStores()
const gensStore = useGenerationsStore()
const { generations } = storeToRefs(gensStore)

function imageUrl(gen: Generation) {
  if (gen.image_storage_path) return gen.image_storage_path
  if (!gen.image_filename) return ''
  return `http://127.0.0.1:8188/view?filename=${encodeURIComponent(gen.image_filename)}&subfolder=${encodeURIComponent(gen.image_subfolder ?? '')}&type=output`
}

function openImage(url: string) {
  window.open(url, '_blank')
}

function download(url: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = ''
  a.click()
}

watchEffect(() => {
  if (auth.isAuthenticated) gensStore.getGenerations()
})
</script>

<template>
  <div class="grid">
    <template v-if="generations.length">
      <div v-for="gen in generations" :key="gen.id" class="card">
        <div class="card-img">
          <img v-if="gen.image_filename" :src="imageUrl(gen)" />
          <span v-else>no image</span>
        </div>

        <div class="card-body">
          <div class="row">
            <span>{{ gen.id }}</span>
            <span>{{ formatDate(gen.created_at) }}</span>
            <span>{{ gen.status }}</span>
          </div>
          <div>{{ gen.model }}</div>
          <details>
            <summary>more</summary>
            <div class="details-body">
              <div class="params">
                <span>steps: {{ gen.steps }}</span>
                <span>cfg: {{ gen.cfg }}</span>
                <span>{{ gen.width }}×{{ gen.height }}</span>
                <span>{{ gen.sampler_name }}</span>
                <span>{{ gen.scheduler }}</span>
                <span>denoise: {{ gen.denoise }}</span>
                <span>seed: {{ gen.seed }}</span>
              </div>
              <div class="text-cell">
                <small>positive</small>
                <div>{{ gen.positive }}</div>
              </div>
              <div class="text-cell">
                <small>negative</small>
                <div>{{ gen.negative }}</div>
              </div>
              <div v-if="gen.error"><small>error</small> {{ gen.error }}</div>
              <div class="mono">{{ gen.prompt_id?.slice(0, 12) }}…</div>
            </div>
          </details>
        </div>

        <div class="card-footer">
          <button v-if="gen.image_filename" @click="openImage(imageUrl(gen))">Open</button>
          <button v-if="gen.image_filename" @click="download(imageUrl(gen))">Download</button>
          <button @click="gensStore.deleteGeneration(gen.id)">Delete</button>
        </div>
      </div>
    </template>
    <p v-else>No generations yet.</p>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: auto auto auto;
  gap: 6px;
  padding: 6px;
}
.card {
  border: 1px solid #000000;
  overflow: hidden;
  min-width: 300px;
}
.card-img {
  padding: 6px;
}
.card-img img {
  max-width: 100%;
  max-height: 160px;
  object-fit: contain;
  display: flex;
  justify-self: center;
}
.card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px;
}
.card-footer {
  display: flex;
  gap: 4px;
  padding: 6px;
  border-top: 1px solid #000;
  justify-content: center;
}
.row {
  display: flex;
  gap: 6px;
  align-items: center;
}
details {
  .details-body {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 4px;
    .params {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
  }
}
.text-cell {
  small {
    font-weight: bold;
    font-size: 0.75em;
  }
  > div {
    font-size: 0.8em;
    white-space: pre-wrap;
  }
}
</style>
