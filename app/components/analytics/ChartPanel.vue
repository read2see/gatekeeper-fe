<script setup lang="ts">
import type { Chart, ChartData, ChartOptions, ChartType } from 'chart.js'
import { useChartTheme } from '~/composables/useChartTheme'

const props = withDefaults(defineProps<{
  title: string
  description?: string
  type: ChartType
  data?: ChartData | null
  options?: ChartOptions
  loading?: boolean
  emptyMessage?: string
  heightClass?: string
}>(), {
  emptyMessage: 'No data for the selected range.',
  heightClass: 'h-72'
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const chartTheme = useChartTheme()
let chartInstance: Chart | null = null
let renderGeneration = 0

const hasData = computed(() => {
  if (!props.data?.datasets?.length) {
    return false
  }

  return props.data.datasets.some(dataset =>
    Array.isArray(dataset.data) && dataset.data.some(value => Number(value) > 0)
  )
})

const showCanvas = computed(() => !props.loading && hasData.value)

let chartModulePromise: Promise<typeof import('chart.js')> | null = null

function loadChartModule() {
  chartModulePromise ??= import('chart.js').then((module) => {
    module.Chart.register(...module.registerables)
    return module
  })

  return chartModulePromise
}

function destroyChart() {
  chartInstance?.destroy()
  chartInstance = null
}

async function renderChart() {
  renderGeneration += 1
  const generation = renderGeneration

  if (!import.meta.client || props.loading || !showCanvas.value) {
    destroyChart()
    return
  }

  await nextTick()
  await nextTick()

  if (generation !== renderGeneration || props.loading || !showCanvas.value) {
    return
  }

  const canvas = canvasRef.value
  if (!canvas || !props.data) {
    return
  }

  const { Chart: ChartJs } = await loadChartModule()

  if (
    generation !== renderGeneration
    || props.loading
    || !showCanvas.value
    || canvasRef.value !== canvas
    || !props.data
  ) {
    return
  }

  destroyChart()

  chartInstance = new ChartJs(canvas, {
    type: props.type,
    data: props.data,
    options: {
      ...chartTheme.getBaseOptions(props.type),
      ...props.options
    }
  })
}

function scheduleRender() {
  if (import.meta.client) {
    void renderChart()
  }
}

watch(showCanvas, (visible) => {
  if (!visible) {
    renderGeneration += 1
    destroyChart()
    return
  }

  scheduleRender()
}, { flush: 'post' })

watch(canvasRef, (canvas) => {
  if (canvas && showCanvas.value) {
    scheduleRender()
  }
}, { flush: 'post' })

watch(
  () => [props.data, props.type, props.options, chartTheme.colors.value] as const,
  () => {
    if (showCanvas.value) {
      scheduleRender()
    }
  },
  { deep: true, flush: 'post' }
)

onMounted(() => {
  scheduleRender()
})

onBeforeUnmount(() => {
  renderGeneration += 1
  destroyChart()
})
</script>

<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <h3 class="text-base font-semibold text-highlighted">
          {{ title }}
        </h3>
        <p
          v-if="description"
          class="text-sm text-muted"
        >
          {{ description }}
        </p>
      </div>
    </template>

    <UiLoadingState
      v-if="loading"
      message="Loading chart..."
    />

    <UiEmptyState
      v-else-if="!hasData"
      :title="emptyMessage"
      icon="i-lucide-bar-chart-3"
    />

    <div
      v-else
      :class="heightClass"
      role="img"
      :aria-label="title"
    >
      <canvas
        ref="canvasRef"
        aria-hidden="true"
      />
    </div>
  </UCard>
</template>
