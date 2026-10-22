<template>
  <div class="search-bar">
    <el-input
      :model-value="modelValue"
      class="search-input"
      :placeholder="placeholder"
      clearable
      @update:model-value="value => $emit('update:modelValue', value)"
      @keyup.enter="$emit('search')"
    />
    <el-button type="primary" :loading="loading" @click="$emit('search')">查询</el-button>
    <el-button :disabled="loading" @click="$emit('reset')">重置</el-button>
    <slot />
  </div>
</template>

<script>
/**
 * 通用搜索栏（课件第 6 课：props / emit 封装）
 *
 * 受控组件：值由父组件通过 v-model 传入，组件本身不保存状态，
 * 避免「父组件重置了关键字，子组件还留着旧值」这类不同步问题。
 */
export default {
  name: 'SearchBar',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '请输入关键字' },
    loading: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'search', 'reset']
}
</script>

<style scoped>
.search-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.search-input {
  width: 240px;
}
</style>
