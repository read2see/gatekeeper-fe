<script setup lang="ts">
import { formatRoleCode } from '~/utils/table'

const props = withDefaults(defineProps<{
  role?: string | null
  fallback?: string
}>(), {
  fallback: 'Member'
})

const label = computed(() => formatRoleCode(props.role, props.fallback))
</script>

<template>
  <UBadge
    color="neutral"
    variant="subtle"
    size="xs"
  >
    {{ label }}
  </UBadge>
</template>
