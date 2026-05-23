<script setup lang="ts">
import type { AnalyticsScope } from '~/composables/useAnalytics'
import type { AnalyticsTimeBucket } from '~/types/api-spec'
import {
  buildBarChartData,
  buildDoughnutChartData,
  buildLineChartData,
  buildMetricCards,
  defaultDateRange,
  extractBreakdownItems,
  extractTimeSeriesPoints,
  fromDateInputValue,
  ORG_METRIC_DEFINITIONS,
  PLATFORM_METRIC_DEFINITIONS,
  toDateInputValue
} from '~/utils/chart'
import { useChartTheme } from '~/composables/useChartTheme'
import { getErrorMessage } from '~/utils/api-errors'

const props = defineProps<{
  scope: AnalyticsScope
  organizationId?: string
  title: string
  description?: string
}>()

const chartTheme = useChartTheme()
const analytics = useAnalytics(props.scope, toRef(props, 'organizationId'))

const bucketOptions = [
  { label: 'Hourly', value: 'HOUR' },
  { label: 'Daily', value: 'DAY' },
  { label: 'Monthly', value: 'MONTH' }
] satisfies Array<{ label: string, value: AnalyticsTimeBucket }>

const initialRange = defaultDateRange()

const filters = reactive({
  bucket: 'DAY' as AnalyticsTimeBucket,
  created_from: initialRange.created_from,
  created_to: initialRange.created_to,
  organization_id: ''
})

const createdFromInput = ref(toDateInputValue(initialRange.created_from))
const createdToInput = ref(toDateInputValue(initialRange.created_to))

const cacheKey = computed(() =>
  props.scope === 'organization'
    ? `org-analytics-${props.organizationId}`
    : 'admin-analytics'
)

const { data, pending, error, refresh } = await useAsyncData(
  cacheKey,
  () => analytics.fetchDashboard({
    bucket: filters.bucket,
    created_from: filters.created_from,
    created_to: filters.created_to,
    ...(props.scope === 'platform' && filters.organization_id
      ? { organization_id: filters.organization_id }
      : {})
  }),
  { watch: [() => props.organizationId] }
)

const metricDefinitions = computed(() =>
  props.scope === 'platform' ? PLATFORM_METRIC_DEFINITIONS : ORG_METRIC_DEFINITIONS
)

const metricCards = computed(() => buildMetricCards(data.value?.overview, metricDefinitions.value))

const timeSeriesChart = computed(() => {
  const points = extractTimeSeriesPoints(data.value?.timeSeries)
  if (!points.length) {
    return null
  }

  return buildLineChartData(points, {
    bucket: filters.bucket,
    primaryColor: chartTheme.colors.value.primary,
    secondaryColor: chartTheme.colors.value.error
  })
})

interface BreakdownPanelConfig {
  key: string
  title: string
  description?: string
  type: 'bar' | 'doughnut'
  horizontal?: boolean
  valueKeys?: string[]
}

const breakdownPanels = computed<BreakdownPanelConfig[]>(() => {
  if (props.scope === 'organization') {
    return [
      { key: 'services', title: 'Requests by service', type: 'bar' },
      { key: 'consumers', title: 'Requests by consumer', type: 'bar' },
      { key: 'apiKeys', title: 'Requests by API key', type: 'bar' },
      { key: 'methods', title: 'Requests by method', type: 'doughnut' },
      { key: 'statusCodes', title: 'Requests by status code', type: 'doughnut' },
      { key: 'topPaths', title: 'Top paths', description: 'Most requested paths', type: 'bar', horizontal: true },
      { key: 'slowestPaths', title: 'Slowest paths', description: 'Highest average latency', type: 'bar', horizontal: true, valueKeys: ['avg_latency_ms', 'p95_latency_ms', 'request_count'] }
    ]
  }

  return [
    { key: 'organizations', title: 'Requests by organization', type: 'bar' },
    { key: 'services', title: 'Requests by service', type: 'bar' },
    { key: 'consumers', title: 'Requests by consumer', type: 'bar' },
    { key: 'apiKeys', title: 'Requests by API key', type: 'bar' },
    { key: 'statusCodes', title: 'Requests by status code', type: 'doughnut' },
    { key: 'topPaths', title: 'Top paths', description: 'Most requested paths', type: 'bar', horizontal: true },
    { key: 'slowestPaths', title: 'Slowest paths', description: 'Highest average latency', type: 'bar', horizontal: true, valueKeys: ['avg_latency_ms', 'p95_latency_ms', 'request_count'] }
  ]
})

function getBreakdownChart(panel: BreakdownPanelConfig) {
  const items = extractBreakdownItems(data.value?.breakdowns[panel.key])
  if (!items.length) {
    return null
  }

  if (panel.type === 'doughnut') {
    return buildDoughnutChartData(items, {
      label: panel.title,
      valueKeys: panel.valueKeys,
      colors: chartTheme.colors.value.palette
    })
  }

  return buildBarChartData(items, {
    label: panel.title,
    valueKeys: panel.valueKeys,
    color: chartTheme.colors.value.primary,
    horizontal: panel.horizontal
  })
}

function applyFilters() {
  const from = fromDateInputValue(createdFromInput.value)
  const to = fromDateInputValue(createdToInput.value, true)

  if (!from || !to) {
    return
  }

  filters.created_from = from
  filters.created_to = to
  refresh()
}

function resetFilters() {
  const range = defaultDateRange()
  filters.bucket = 'DAY'
  filters.organization_id = ''
  filters.created_from = range.created_from
  filters.created_to = range.created_to
  createdFromInput.value = toDateInputValue(range.created_from)
  createdToInput.value = toDateInputValue(range.created_to)
  refresh()
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <UiPageHeader
      :title="title"
      :description="description"
    >
      <template #actions>
        <UButton
          icon="i-lucide-refresh-cw"
          variant="soft"
          color="neutral"
          :loading="pending"
          @click="refresh()"
        >
          Refresh
        </UButton>
      </template>
    </UiPageHeader>

    <UCard>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <UFormField label="From">
          <UInput
            v-model="createdFromInput"
            type="date"
          />
        </UFormField>

        <UFormField label="To">
          <UInput
            v-model="createdToInput"
            type="date"
          />
        </UFormField>

        <UFormField label="Bucket">
          <USelect
            v-model="filters.bucket"
            :items="bucketOptions"
            value-key="value"
            label-key="label"
          />
        </UFormField>

        <UFormField
          v-if="scope === 'platform'"
          label="Organization ID"
        >
          <UInput
            v-model="filters.organization_id"
            placeholder="Optional filter"
          />
        </UFormField>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <UButton
          icon="i-lucide-filter"
          :loading="pending"
          @click="applyFilters()"
        >
          Apply filters
        </UButton>
        <UButton
          variant="soft"
          color="neutral"
          @click="resetFilters()"
        >
          Reset
        </UButton>
      </div>
    </UCard>

    <UiErrorState
      v-if="error && !data"
      title="Failed to load analytics"
      :message="getErrorMessage(error)"
      retryable
      @retry="refresh()"
    />

    <template v-else>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnalyticsMetricCard
          v-for="metric in metricCards"
          :key="metric.key"
          :label="metric.label"
          :value="metric.value"
          :format="metric.format"
          :icon="metric.icon"
        />

        <template v-if="pending && !metricCards.length">
          <UCard
            v-for="index in 3"
            :key="`metric-loading-${index}`"
          >
            <UiLoadingState message="Loading metrics..." />
          </UCard>
        </template>
      </div>

      <AnalyticsChartPanel
        title="Request volume"
        description="Requests and errors over time"
        type="line"
        :data="timeSeriesChart"
        :loading="pending"
      />

      <div class="grid gap-4 xl:grid-cols-2">
        <AnalyticsChartPanel
          v-for="panel in breakdownPanels"
          :key="panel.key"
          :title="panel.title"
          :description="panel.description"
          :type="panel.type"
          :data="getBreakdownChart(panel)"
          :loading="pending"
          :options="panel.horizontal ? { indexAxis: 'y' } : undefined"
        />
      </div>
    </template>
  </div>
</template>
