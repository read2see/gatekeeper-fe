<script setup lang="ts">
defineProps<{
  message?: string | null
}>()
</script>

<template>
  <UAlert
    v-if="message"
    color="error"
    variant="subtle"
    :description="message"
  />
</template>
