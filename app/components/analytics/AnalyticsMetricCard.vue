<script setup lang="ts">
import type { MetricFormat } from '~/utils/metric'
import { formatMetricValue } from '~/utils/metric'

const props = withDefaults(defineProps<{
  label: string
  value?: number | null
  format?: MetricFormat
  icon?: string
  loading?: boolean
}>(), {
  format: 'number',
  loading: false
})

const displayValue = computed(() => {
  if (props.value == null || Number.isNaN(props.value)) {
    return '—'
  }

  return formatMetricValue(props.value, props.format)
})
</script>

<template>
  <UCard>
    <div class="space-y-3">
      <div class="flex items-start justify-between gap-3">
        <p class="text-sm text-muted">
          {{ label }}
        </p>
        <div
          v-if="icon"
          class="rounded-lg bg-primary/10 p-2"
        >
          <UIcon
            :name="icon"
            class="size-4 text-primary"
          />
        </div>
      </div>

      <UiLoadingState
        v-if="loading"
        message="Loading metric..."
      />

      <p
        v-else
        class="text-3xl font-semibold text-highlighted"
      >
        {{ displayValue }}
      </p>
    </div>
  </UCard>
</template>
