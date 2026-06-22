<script setup lang="ts">
import { watchEffect, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useStores } from '@/stores'
import { useNotesStore } from '@/stores/notes'
import { formatDate } from '@/utils/utils'

import type { Note } from '@/stores/notes'

const { auth } = useStores()
const notesStore = useNotesStore()
const { notes } = storeToRefs(notesStore)
const sortedNotes = computed(() =>
  [...notes.value].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  ),
)

const loading = ref(false)
const loaded = ref(false)

watchEffect(async () => {
  if (auth.isAuthenticated && !loaded.value) {
    loading.value = true
    await notesStore.getNotes()
    loading.value = false
    loaded.value = true
  }
})

const isForm = ref(false)
const newContent = ref('')

function enableForm() {
  isForm.value = true
}

function cancelForm() {
  isForm.value = false
  newContent.value = ''
}

async function submit() {
  if (!newContent.value.trim()) return
  await notesStore.createNote(newContent.value)
  newContent.value = ''
  isForm.value = false
}

async function deleteNote(note_id: Note['id']) {
  await notesStore.deleteNote(note_id)
}

const editId = ref<Note['id'] | null>(null)
const editContent = ref('')

function enableEdit(note: Note) {
  editId.value = note.id
  editContent.value = note.content ?? ''
}

async function saveEdit() {
  if (editId.value === null) return
  await notesStore.updateNote(editId.value, editContent.value)
  editId.value = null
}
</script>

<template>
  <div class="page">
    <p v-if="loading" class="loading">Loading...</p>
    <template v-else>
      <div class="header-panel">
        <h2>Notes</h2>
        <div class="toolbar-buttons">
          <button v-if="!isForm" @click="enableForm">+ New Note</button>
          <p v-if="!sortedNotes.length && !isForm">No notes yet.</p>
        </div>
      </div>

      <div class="grid">
        <div v-if="isForm" class="card">
          <div class="card-body">
            <textarea
              v-model="newContent"
              placeholder="Note content..."
              rows="10"
              class="full-width"
            ></textarea>
          </div>
          <div class="card-footer">
            <button @click="submit" :disabled="!newContent.trim()">Save</button>
            <button @click="cancelForm">Cancel</button>
          </div>
        </div>

        <div v-for="note in sortedNotes" :key="note.id" class="card">
          <div class="card-body">
            <template v-if="editId === note.id">
              <textarea v-model="editContent" rows="4" class="full-width"></textarea>
            </template>
            <template v-else>
              <div class="note-content">{{ note.content }}</div>
            </template>
          </div>

          <small class="card-date">{{ formatDate(note.created_at) }}</small>

          <div class="card-footer">
            <template v-if="editId === note.id">
              <button @click="saveEdit">Save</button>
              <button @click="editId = null">Cancel</button>
            </template>
            <template v-else>
              <button @click="enableEdit(note)">Edit</button>
              <button @click="deleteNote(note.id)">Delete</button>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins';

.toolbar {
  @extend %column-layout;
  @extend %gap;
  max-width: fit-content;
}

.full-width {
  width: 100%;
  box-sizing: border-box;
}

.actions {
  @extend %row-layout;
  @extend %gap;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  @extend %gap;
}

.card {
  @extend %border, %column-layout;
  overflow: hidden;
  min-height: 200px;
}

.card-body {
  @extend %column-layout;
  @extend %gap;
  flex: 1;
  justify-content: center;
}

.card-date {
  @extend %gap;
  opacity: 0.6;
  text-align: right;
}

.card-footer {
  @extend %row-layout, %gap;
  border-top: 1px solid #000;
  justify-content: center;
}
.note-content {
  font-size: 0.9em;
  white-space: pre-wrap;
  word-break: break-word;
  text-align-last: center;
  text-align: left;
}
</style>
