<script setup lang="ts">
import { reactive } from "vue";
import { useComfyStore } from "@/stores/comfy";
import { comfyDefaults } from "@/configs/comfy";

const comfy = useComfyStore();

const params = reactive({
  positive: comfyDefaults.positive,
  negative: comfyDefaults.negative,
  steps: comfyDefaults.steps,
  cfg: comfyDefaults.cfg,
  denoise: comfyDefaults.denoise,
  width: comfyDefaults.width,
  height: comfyDefaults.height,
  seed: null as number | null,
  sampler_name: comfyDefaults.sampler_name,
  scheduler: comfyDefaults.scheduler,
});

function handleGenerate() {
  const seed = params.seed != null && !Number.isNaN(params.seed) ? params.seed : undefined;
  comfy.generate({ ...params, seed });
}

function download(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  a.click();
}

function openImage() {
  window.open(comfy.imageUrl, "_blank");
}
</script>

<template>
  <div>
    <textarea v-model="params.positive" placeholder="Positive prompt" rows="3" id="positive" />
    <textarea v-model="params.negative" placeholder="Negative prompt" rows="2" id="negative" />

    <div class="params">
      <label>Steps <input v-model.number="params.steps" type="number" min="1" max="150" /></label>
      <label
        >CFG <input v-model.number="params.cfg" type="number" min="1" max="30" step="0.5"
      /></label>
      <label
        >Denoise <input v-model.number="params.denoise" type="number" min="0" max="1" step="0.05"
      /></label>
      <label
        >Width <input v-model.number="params.width" type="number" min="64" max="2048" step="64"
      /></label>
      <label
        >Height <input v-model.number="params.height" type="number" min="64" max="2048" step="64"
      /></label>
      <label>Seed <input v-model.number="params.seed" type="number" placeholder="random" /></label>
      <label>
        Sampler
        <select v-model="params.sampler_name">
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
        <select v-model="params.scheduler">
          <option>normal</option>
          <option>karras</option>
          <option>exponential</option>
          <option>sgm_uniform</option>
          <option>simple</option>
        </select>
      </label>
    </div>

    <div class="actions">
      <button
        :disabled="comfy.status === 'generating' || comfy.status === 'queued'"
        @click="handleGenerate"
      >
        {{
          comfy.status === "generating" || comfy.status === "queued" ? "Generating..." : "Generate"
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
        <button @click="comfy.reset">Clear result</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error {
  color: #e00;
}
textarea {
  display: flex;
  min-width: 400px;
  width: 100%;
  margin: 6px;
}
img {
  max-width: 512px;
  margin-top: 12px;
}
.actions {
  width: auto;
  display: flex;
  justify-content: center;
}

.params {
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: 6px;
  margin: 6px;
  label {
    font-size: 0.85em;
  }
  input,
  select {
    display: block;
    width: 110px;
  }
}
</style>
