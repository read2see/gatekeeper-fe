import type { ChartOptions, ChartType } from 'chart.js'

export function useChartTheme() {
  const colorMode = useColorMode()

  const palette = [
    '#00C16A',
    '#38bdf8',
    '#f472b6',
    '#fbbf24',
    '#a78bfa',
    '#fb7185',
    '#2dd4bf',
    '#f97316'
  ]

  const colors = computed(() => {
    const isDark = colorMode.value === 'dark'

    return {
      text: isDark ? '#94a3b8' : '#64748b',
      grid: isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(100, 116, 139, 0.15)',
      primary: '#00C16A',
      error: '#fb7185',
      palette
    }
  })

  function getBaseOptions(type: ChartType): ChartOptions {
    const theme = colors.value

    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 250
      },
      plugins: {
        legend: {
          labels: {
            color: theme.text,
            boxWidth: 12,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: colorMode.value === 'dark' ? '#0f172a' : '#ffffff',
          titleColor: colorMode.value === 'dark' ? '#f8fafc' : '#0f172a',
          bodyColor: theme.text,
          borderColor: theme.grid,
          borderWidth: 1,
          padding: 12
        }
      }
    }

    if (type === 'line' || type === 'bar') {
      options.scales = {
        x: {
          ticks: { color: theme.text },
          grid: { color: theme.grid }
        },
        y: {
          beginAtZero: true,
          ticks: { color: theme.text },
          grid: { color: theme.grid }
        }
      }
    }

    if (type === 'bar') {
      options.indexAxis = 'x'
    }

    return options
  }

  return {
    colors,
    getBaseOptions
  }
}
