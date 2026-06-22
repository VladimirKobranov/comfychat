<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useStores } from '@/stores'
import { useGenerationsStore } from '@/stores/generations'
import { formatDate } from '@/utils/utils'

import type { Generation } from '@/stores/generations'

const { auth } = useStores()
const gensStore = useGenerationsStore()
const { generations } = storeToRefs(gensStore)
const loading = ref(false)
const loaded = ref(false)

watchEffect(async () => {
  if (auth.isAuthenticated && !loaded.value) {
    loading.value = true
    await gensStore.getGenerations()
    loading.value = false
    loaded.value = true
  }
})

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
</script>

<template>
  <div class="page">
    <p v-if="loading">Loading...</p>
    <template v-else>
      <div class="header-panel">
        <h2>Generations</h2>
        <div class="toolbar-buttons">
          total: <kbd>{{ generations.length }}</kbd>
        </div>
      </div>
      <template v-if="generations.length">
        <div class="grid">
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
                  <code>{{ gen.prompt_id }}</code>
                </div>
              </details>
            </div>

            <div class="card-footer">
              <button v-if="gen.image_filename" @click="openImage(imageUrl(gen))">Open</button>
              <button v-if="gen.image_filename" @click="download(imageUrl(gen))">Download</button>
              <button @click="gensStore.deleteGeneration(gen.id)">Delete</button>
            </div>
          </div>
        </div>
      </template>
      <p v-else>No generations yet.</p>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins';

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 6px;
}
.card {
  @extend %border;
  overflow: hidden;
}
.card-img {
  @extend %gap;
}
.card-img img {
  max-width: 100%;
  max-height: 160px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}
.card-body {
  @extend %column-layout;
  @extend %gap;
}
.card-footer {
  @extend %row-layout, %gap;
  border-top: 1px solid #000;
  justify-content: center;
}
.row {
  @extend %row-layout;
  @extend %gap;
  align-items: center;
}
details {
  .details-body {
    @extend %column-layout, %gap;

    .params {
      @extend %row-layout, %gap;
      flex-wrap: wrap;
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
