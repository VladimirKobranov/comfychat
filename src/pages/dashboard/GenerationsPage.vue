<script setup lang="ts">
import { watchEffect } from "vue";
import { storeToRefs } from "pinia";
import { useStores } from "@/stores";
import { useGenerationsStore } from "@/stores/generations";
import { formatDate } from "@/utils/utils";

import type { Generation } from "@/stores/generations";

const { auth } = useStores();
const gensStore = useGenerationsStore();
const { generations } = storeToRefs(gensStore);

function imageUrl(gen: Generation) {
  if (gen.image_storage_path) return gen.image_storage_path;
  if (!gen.image_filename) return "";
  return `http://127.0.0.1:8188/view?filename=${encodeURIComponent(gen.image_filename)}&subfolder=${encodeURIComponent(gen.image_subfolder ?? "")}&type=output`;
}

function openImage(url: string) {
  window.open(url, "_blank");
}

function download(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  a.click();
}

watchEffect(() => {
  if (auth.isAuthenticated) gensStore.getGenerations();
});
</script>

<template>
  <div class="grid">
    <template v-if="generations.length">
      <div v-for="gen in generations" :key="gen.id" class="card">
        <div class="card-img">
          <img v-if="gen.image_filename" :src="imageUrl(gen)" />
          <span v-else>no image</span>
          <div v-if="gen.image_filename" class="row">
            <button @click="openImage(imageUrl(gen))">Open</button>
            <button @click="download(imageUrl(gen))">Download</button>
          </div>
        </div>

        <div class="card-body">
          <div class="row">
            <span>{{ gen.id }}</span>
            <span>{{ formatDate(gen.created_at) }}</span>
            <span>{{ gen.status }}</span>
          </div>
          <div>{{ gen.model }}</div>
          <div class="params">
            <span>steps: {{ gen.steps }}</span>
            <span>cfg: {{ gen.cfg }}</span>
            <span>{{ gen.width }}×{{ gen.height }}</span>
            <span>{{ gen.sampler_name }}</span>
            <span>{{ gen.scheduler }}</span>
            <span>denoise: {{ gen.denoise }}</span>
          </div>
          <div class="row">
            <div class="text-cell">
              <small>positive</small>
              <div>{{ gen.positive }}</div>
            </div>
            <div class="text-cell">
              <small>negative</small>
              <div>{{ gen.negative }}</div>
            </div>
          </div>
          <div v-if="gen.error">{{ gen.error }}</div>
          <div class="row">
            <span>{{ gen.prompt_id?.slice(0, 12) }}…</span>
            <span>seed: {{ gen.seed }}</span>
            <button @click="gensStore.deleteGeneration(gen.id)">delete</button>
          </div>
        </div>
      </div>
    </template>
    <p v-else>No generations yet.</p>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 6px;
  padding: 6px;
  grid-auto-flow: row;
}
.card {
  border: 1px solid #000000;
  overflow: hidden;
}
.card-img {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px;
}
.card-img img {
  max-width: 100%;
  max-height: 160px;
  object-fit: contain;
}
.card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px;
}
.row {
  display: flex;
  gap: 6px;
  align-items: center;
}
.params {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
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
