<script setup lang="ts">
const props = withDefaults(defineProps<{
  status?: string | null
  fallback?: string
}>(), {
  fallback: 'ACTIVE'
})

const label = computed(() => props.status ?? props.fallback)

const color = computed(() => {
  switch ((props.status ?? props.fallback).toUpperCase()) {
    case 'ACTIVE':
      return 'success'
    case 'SUSPENDED':
      return 'warning'
    case 'ARCHIVED':
    case 'REMOVED':
      return 'neutral'
    case 'REVOKED':
      return 'error'
    default:
      return 'neutral'
  }
})
</script>

<template>
  <UBadge
    :color="color"
    variant="subtle"
    size="xs"
  >
    {{ label }}
  </UBadge>
</template>
