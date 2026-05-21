<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-4 border-b border-default pb-6 sm:flex-row sm:items-start sm:justify-between">
    <div class="space-y-1">
      <h1 class="text-2xl font-semibold text-highlighted">
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="text-sm text-muted"
      >
        {{ description }}
      </p>
    </div>

    <div
      v-if="$slots.actions"
      class="flex shrink-0 flex-wrap items-center gap-2"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
