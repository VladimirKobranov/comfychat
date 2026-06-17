<script setup lang="ts">
import { useStores } from '@/stores'

const { auth } = useStores()
</script>

<template>
  <h4>profile page</h4>
  <div>
    <span>id:</span>
    <span>{{ auth.user?.id }}</span>
  </div>
  <div class="panel">
    <span>email:</span>
    <span>{{ auth.user?.email }}</span>
  </div>
</template>
