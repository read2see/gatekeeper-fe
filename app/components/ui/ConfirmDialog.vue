<script setup lang="ts">
const { isOpen, options, accept, dismiss } = useConfirm()

const confirmColor = computed(() => {
  if (options.value?.confirmColor) {
    return options.value.confirmColor
  }

  return options.value?.destructive ? 'error' : 'primary'
})

watch(isOpen, (open, wasOpen) => {
  if (wasOpen && !open && options.value) {
    dismiss()
  }
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="options?.title"
    :description="options?.description"
    :ui="{ footer: 'justify-end gap-2' }"
  >
    <template #footer>
      <UButton
        color="neutral"
        variant="outline"
        :label="options?.cancelLabel ?? 'Cancel'"
        @click="dismiss"
      />
      <UButton
        :color="confirmColor"
        :label="options?.confirmLabel ?? 'Confirm'"
        @click="accept"
      />
    </template>
  </UModal>
</template>
