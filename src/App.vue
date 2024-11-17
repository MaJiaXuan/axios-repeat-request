<script setup>
import Box from '@components/Box'
import { nextTick, ref } from 'vue'

const length = ref(8)
const load = ref(false)
const isSuper = ref(false)

const handleReload = () => {
  length.value = 8
  isSuper.value = false
  load.value = false
  nextTick(() => {
    load.value = true
  })
}

const handleReloadSuper = () => {
  length.value = 0
  isSuper.value = true
  load.value = false
  nextTick(async () => {
    load.value = true
    const arr = Array.from({ length: 8 })
    for (const value of arr) {
      length.value++
      await nextTick()
    }
  })
}

const handleClear = () => {
  load.value = false
}
</script>

<template>
  <div class="app">
    <div class="app-header">
      <button @click="handleReload">重新加载</button>
      <button @click="handleReloadSuper">重新加载Super</button>
      <button @click="handleClear">清空</button>
    </div>
    <div class="app-container" v-if="load">
      <Box :isSuper="isSuper" v-for="(item, index) in length" :key="index" />
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
