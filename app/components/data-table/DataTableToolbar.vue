<script setup lang="ts">
defineProps<{
  searchable?: boolean
  searchPlaceholder?: string
  pending?: boolean
}>()

const search = defineModel<string>('search', { default: '' })

const emit = defineEmits<{
  refresh: []
}>()
</script>

<template>
  <div class="flex flex-col gap-3 border-b border-default px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex flex-1 items-center gap-2">
      <UInput
        v-if="searchable"
        v-model="search"
        icon="i-lucide-search"
        :placeholder="searchPlaceholder ?? 'Search...'"
        aria-label="Search table"
        class="w-full max-w-sm"
      />

      <slot name="leading" />
    </div>

    <div class="flex items-center gap-2">
      <slot name="trailing" />

      <UButton
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="ghost"
        size="sm"
        :loading="pending"
        aria-label="Refresh table"
        @click="emit('refresh')"
      />
    </div>
  </div>
</template>
