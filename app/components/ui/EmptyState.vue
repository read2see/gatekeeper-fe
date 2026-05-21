<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  icon?: string
}>(), {
  title: 'Nothing here yet',
  description: 'Get started by creating your first item.',
  icon: 'i-lucide-inbox'
})
</script>

<template>
  <div class="flex flex-col items-center justify-center px-4 py-16 text-center">
    <div class="mb-4 flex size-12 items-center justify-center rounded-full bg-elevated">
      <UIcon
        :name="icon"
        class="size-6 text-muted"
        aria-hidden="true"
      />
    </div>

    <h2 class="text-lg font-semibold text-highlighted">
      {{ title }}
    </h2>

    <p class="mt-2 max-w-md text-sm text-muted">
      {{ description }}
    </p>

    <div
      v-if="$slots.actions"
      class="mt-6 flex flex-wrap items-center justify-center gap-2"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
