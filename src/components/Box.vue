<script setup>
import { getData } from '@api'
import { getDataV2 } from '@api/super'
import { ref } from 'vue'

const props = defineProps({
  isSuper: {
    type: Boolean,
    default: false,
  },
})

const value = ref(null)
const error = ref(null)
const loading = ref(null)

const init = () => {
  loading.value = true
  ;(props.isSuper ? getDataV2 : getData)({ a: 123 })
    .then((res) => {
      value.value = res
      error.value = null
    })
    .catch((err) => {
      console.log(err)
      error.value = err
      value.value = null
    })
    .finally(() => {
      loading.value = false
    })
}

init()
</script>

<template>
  <div class="box">
    <template v-if="loading">正在加载数据中...</template>
    <template v-if="value">{{ value }}</template>
    <template v-else>{{ error }}</template>
  </div>
</template>

<style scoped>
.box {
  width: 300px;
  height: 300px;
  background-color: #1b1b1f;
  color: #9ecbff;
  font-size: 22px;
  border-radius: 4px;
  padding: 8px;
}

.box:not(:last-child) {
  margin-right: 4px;
}
</style>
