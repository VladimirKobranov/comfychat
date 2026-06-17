<script setup lang="ts">
import { watchEffect, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useStores } from '@/stores'
import { useNotesStore } from '@/stores/notes'
import { formatDate } from '@/utils/utils'

const { auth } = useStores()
const notesStore = useNotesStore()
const { notes } = storeToRefs(notesStore)

const isForm = ref(false)
const content = ref('')

function enableForm() {
  isForm.value = true
}

async function submit() {
  if (!content.value.trim()) return
  await notesStore.createNote(content.value)
  content.value = ''
  isForm.value = false
}

watchEffect(() => {
  if (auth.isAuthenticated) notesStore.getNotes()
})
</script>

<template>
  <div>
    <table v-if="notes.length">
      <thead>
        <tr>
          <th>id</th>
          <th>created_at</th>
          <th>content</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="note in notes" :key="note.id">
          <td>{{ note.id }}</td>
          <td>{{ formatDate(note.created_at) }}</td>
          <td>{{ note.content }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="form">
    <button @click="enableForm">add new</button>

    <form v-if="isForm" @submit.prevent="submit">
      <input v-model="content" placeholder="content" />
      <button type="submit">save</button>
    </form>
  </div>
</template>
