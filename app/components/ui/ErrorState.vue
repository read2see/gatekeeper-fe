<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  message?: string
  retryLabel?: string
  retryable?: boolean
}>(), {
  title: 'Something went wrong',
  message: 'An unexpected error occurred. Please try again.',
  retryLabel: 'Try again',
  retryable: false
})

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center px-4 py-16 text-center">
    <div class="mb-4 flex size-12 items-center justify-center rounded-full bg-error/10">
      <UIcon
        name="i-lucide-circle-alert"
        class="size-6 text-error"
        aria-hidden="true"
      />
    </div>

    <h2 class="text-lg font-semibold text-highlighted">
      {{ title }}
    </h2>

    <p class="mt-2 max-w-md text-sm text-muted">
      {{ message }}
    </p>

    <UButton
      v-if="retryable"
      class="mt-6"
      color="neutral"
      variant="outline"
      icon="i-lucide-refresh-cw"
      :label="retryLabel"
      @click="emit('retry')"
    />
  </div>
</template>
