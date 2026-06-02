import type { ChartData } from 'chart.js'
import type { AnalyticsTimeBucket } from '~/types/api-spec'
import type {
  AnalyticsBreakdown,
  AnalyticsBreakdownItem,
  AnalyticsOverview,
  AnalyticsTimeSeries,
  AnalyticsTimeSeriesPoint
} from '~/types/domain'
import type { MetricFormat } from '~/utils/metric'

export interface MetricDefinition {
  key: string
  label: string
  format: MetricFormat
  icon: string
}

export interface MetricCardData {
  key: string
  label: string
  value: number
  format: MetricFormat
  icon: string
}

export const ORG_METRIC_DEFINITIONS: MetricDefinition[] = [
  { key: 'total_requests', label: 'Total requests', format: 'number', icon: 'i-lucide-activity' },
  { key: 'error_requests', label: 'Error requests', format: 'number', icon: 'i-lucide-alert-circle' },
  { key: 'error_rate', label: 'Error rate', format: 'percent', icon: 'i-lucide-percent' },
  { key: 'avg_latency_ms', label: 'Avg latency', format: 'duration', icon: 'i-lucide-timer' },
  { key: 'p95_latency_ms', label: 'P95 latency', format: 'duration', icon: 'i-lucide-gauge' },
  { key: 'rate_limited_requests', label: 'Rate limited', format: 'number', icon: 'i-lucide-shield-alert' }
]

export const PLATFORM_METRIC_DEFINITIONS: MetricDefinition[] = [
  ...ORG_METRIC_DEFINITIONS,
  { key: 'total_users', label: 'Total users', format: 'number', icon: 'i-lucide-users' },
  { key: 'active_users', label: 'Active users', format: 'number', icon: 'i-lucide-user-check' },
  { key: 'total_organizations', label: 'Total organizations', format: 'number', icon: 'i-lucide-building-2' },
  { key: 'active_organizations', label: 'Active organizations', format: 'number', icon: 'i-lucide-building' }
]

export function defaultDateRange(days = 30) {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - days)

  return {
    created_from: from.toISOString(),
    created_to: to.toISOString()
  }
}

export function toDateInputValue(value?: string) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 10)
}

export function fromDateInputValue(value: string, endOfDay = false) {
  if (!value) {
    return undefined
  }

  const date = new Date(`${value}T${endOfDay ? '23:59:59' : '00:00:00'}`)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.toISOString()
}

export function buildMetricCards(
  overview: AnalyticsOverview | null | undefined,
  definitions: MetricDefinition[]
): MetricCardData[] {
  if (!overview) {
    return []
  }

  return definitions
    .filter(definition => typeof overview[definition.key] === 'number')
    .map(definition => ({
      key: definition.key,
      label: definition.label,
      value: overview[definition.key] as number,
      format: definition.format,
      icon: definition.icon
    }))
}

export function extractTimeSeriesPoints(
  data: AnalyticsTimeSeries | AnalyticsTimeSeriesPoint[] | null | undefined
): AnalyticsTimeSeriesPoint[] {
  if (!data) {
    return []
  }

  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data.points)) {
    return data.points
  }

  if (Array.isArray(data.items)) {
    return data.items
  }

  return []
}

export function extractBreakdownItems(
  data: AnalyticsBreakdown | AnalyticsBreakdownItem[] | null | undefined
): AnalyticsBreakdownItem[] {
  if (!data) {
    return []
  }

  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data.items)) {
    return data.items
  }

  return []
}

export function getTimeSeriesLabel(point: AnalyticsTimeSeriesPoint, bucket?: AnalyticsTimeBucket) {
  const raw = point.bucket_start ?? point.bucket ?? point.timestamp
  if (!raw) {
    return ''
  }

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) {
    return String(raw)
  }

  if (bucket === 'HOUR') {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric'
    }).format(date)
  }

  if (bucket === 'MONTH') {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export function getNumericField(
  record: Record<string, unknown>,
  keys: string[],
  fallback = 0
) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
  }

  return fallback
}

export function getBreakdownLabel(item: AnalyticsBreakdownItem) {
  const label = item.label
    ?? item.name
    ?? item.organization_name
    ?? item.service_name
    ?? item.consumer_name
    ?? item.api_key_name
    ?? item.method
    ?? (item.status_code != null ? String(item.status_code) : undefined)
    ?? item.path
    ?? item.id

  return label ? String(label) : 'Unknown'
}

export function buildLineChartData(
  points: AnalyticsTimeSeriesPoint[],
  options: {
    bucket?: AnalyticsTimeBucket
    primaryLabel?: string
    secondaryLabel?: string
    primaryColor: string
    secondaryColor?: string
  }
): ChartData<'line'> {
  const labels = points.map(point => getTimeSeriesLabel(point, options.bucket))
  const requestValues = points.map(point =>
    getNumericField(point, ['request_count', 'requests'])
  )
  const errorValues = points.map(point =>
    getNumericField(point, ['error_count', 'errors'])
  )

  const datasets = [
    {
      label: options.primaryLabel ?? 'Requests',
      data: requestValues,
      borderColor: options.primaryColor,
      backgroundColor: `${options.primaryColor}33`,
      tension: 0.3,
      fill: true,
      pointRadius: 2,
      pointHoverRadius: 4
    }
  ]

  if (options.secondaryColor && errorValues.some(value => value > 0)) {
    datasets.push({
      label: options.secondaryLabel ?? 'Errors',
      data: errorValues,
      borderColor: options.secondaryColor,
      backgroundColor: `${options.secondaryColor}33`,
      tension: 0.3,
      fill: false,
      pointRadius: 2,
      pointHoverRadius: 4
    })
  }

  return { labels, datasets }
}

export function buildBarChartData(
  items: AnalyticsBreakdownItem[],
  options: {
    label?: string
    valueKeys?: string[]
    maxItems?: number
    color: string
    horizontal?: boolean
  }
): ChartData<'bar'> {
  const valueKeys = options.valueKeys ?? ['request_count', 'requests', 'count', 'avg_latency_ms', 'p95_latency_ms']
  const sorted = [...items]
    .sort((left, right) =>
      getNumericField(right, valueKeys) - getNumericField(left, valueKeys)
    )
    .slice(0, options.maxItems ?? 10)

  const labels = sorted.map(item => getBreakdownLabel(item))
  const values = sorted.map(item => getNumericField(item, valueKeys))

  return {
    labels,
    datasets: [
      {
        label: options.label ?? 'Count',
        data: values,
        backgroundColor: `${options.color}CC`,
        borderColor: options.color,
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  }
}

export function buildDoughnutChartData(
  items: AnalyticsBreakdownItem[],
  options: {
    label?: string
    valueKeys?: string[]
    maxItems?: number
    colors: string[]
  }
): ChartData<'doughnut'> {
  const valueKeys = options.valueKeys ?? ['request_count', 'requests', 'count']
  const sorted = [...items]
    .sort((left, right) =>
      getNumericField(right, valueKeys) - getNumericField(left, valueKeys)
    )
    .slice(0, options.maxItems ?? 8)

  return {
    labels: sorted.map(item => getBreakdownLabel(item)),
    datasets: [
      {
        label: options.label ?? 'Count',
        data: sorted.map(item => getNumericField(item, valueKeys)),
        backgroundColor: sorted.map((_, index) => options.colors[index % options.colors.length] ?? '#00C16A'),
        borderWidth: 0
      }
    ]
  }
}
