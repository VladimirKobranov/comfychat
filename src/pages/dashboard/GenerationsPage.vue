<script setup lang="ts">
import { watchEffect, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useStores } from '@/stores'
import { useGenerationsStore } from '@/stores/generations'
import { formatDate } from '@/utils/utils'

import type { Generation } from '@/stores/generations'

const { auth } = useStores()
const gensStore = useGenerationsStore()
const { generations } = storeToRefs(gensStore)

const deleteId = ref<Generation['id'] | null>(null)

async function confirmDelete() {
  if (deleteId.value === null) return
  await gensStore.deleteGeneration(deleteId.value)
  deleteId.value = null
}

function imageUrl(gen: Generation) {
  if (!gen.image_filename) return ''
  return `http://127.0.0.1:8188/view?filename=${encodeURIComponent(gen.image_filename)}&subfolder=${encodeURIComponent(gen.image_subfolder ?? '')}&type=output`
}

watchEffect(() => {
  if (auth.isAuthenticated) gensStore.getGenerations()
})
</script>

<template>
  <div>
    <table v-if="generations.length">
      <thead>
        <tr>
          <th>id</th>
          <th>created_at</th>
          <th>positive</th>
          <th>status</th>
          <th>image</th>
          <th>delete</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="gen in generations" :key="gen.id">
          <td>{{ gen.id }}</td>
          <td>{{ formatDate(gen.created_at) }}</td>
          <td>{{ gen.positive.slice(0, 60) }}...</td>
          <td>{{ gen.status }}</td>
          <td>
            <img v-if="gen.image_filename" :src="imageUrl(gen)" class="thumb" />
          </td>
          <td>
            <template v-if="deleteId === gen.id">
              <button @click="confirmDelete">confirm</button>
              <button @click="deleteId = null">cancel</button>
            </template>
            <button v-else @click="deleteId = gen.id">delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>No generations yet.</p>
  </div>
</template>

<style lang="scss" scoped>
img.thumb {
  max-width: 100px;
  max-height: 60px;
}
</style>
