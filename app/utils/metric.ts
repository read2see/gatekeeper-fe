export type MetricFormat = 'number' | 'percent' | 'duration'

export function formatMetricValue(value: number, format: MetricFormat) {
  switch (format) {
    case 'percent':
      return `${(value * 100).toFixed(value < 0.01 && value > 0 ? 2 : 1)}%`
    case 'duration':
      return value >= 1000 ? `${(value / 1000).toFixed(2)}s` : `${Math.round(value)}ms`
    default:
      return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }
}
