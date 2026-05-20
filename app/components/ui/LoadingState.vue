<script setup lang="ts">
withDefaults(defineProps<{
  message?: string
}>(), {
  message: 'Loading...'
})
</script>

<template>
  <div
    role="status"
    aria-live="polite"
    class="flex flex-col items-center justify-center gap-4 px-4 py-16"
  >
    <UIcon
      name="i-lucide-loader-circle"
      class="size-8 animate-spin text-primary"
      aria-hidden="true"
    />
    <p class="text-sm text-muted">
      {{ message }}
    </p>
  </div>
</template>
