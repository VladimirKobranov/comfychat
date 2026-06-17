<script setup lang="ts">
import { watchEffect } from "vue";
import { storeToRefs } from "pinia";
import { useStores } from "@/stores";
import { useNotesStore } from "@/stores/notes";
import { formatDate } from "@/utils/utils";

const { auth } = useStores();
const notesStore = useNotesStore();
const { notes } = storeToRefs(notesStore);

watchEffect(() => {
  if (auth.isAuthenticated) notesStore.getNotes();
});
</script>

<template>
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
</template>
