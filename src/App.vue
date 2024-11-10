<script setup>
import Box from '@components/Box'
import { nextTick, ref } from 'vue'

const length = ref(8)
const load = ref(false)

const handleReload = () => {
  load.value = false
  nextTick(() => {
    load.value = true
  })
}
</script>

<template>
  <div class="app">
    <div class="app-header">
      <button @click="handleReload">重新加载</button>
    </div>
    <div class="app-container" v-if="load">
      <Box v-for="(item, index) in length" :key="index" />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-wrap: wrap;
  row-gap: 4px;
}
</style>
