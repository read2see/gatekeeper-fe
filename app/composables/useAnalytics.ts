import { apiSpec } from '~/types/api-spec'
import type { AnalyticsQuery, AnalyticsTimeBucket } from '~/types/api-spec'
import type {
  AnalyticsBreakdown,
  AnalyticsOverview,
  AnalyticsTimeSeries
} from '~/types/domain'

export type AnalyticsScope = 'platform' | 'organization'

export interface AnalyticsFilters extends AnalyticsQuery {
  bucket?: AnalyticsTimeBucket
  organization_id?: string
}

export interface AnalyticsDashboardData {
  overview: AnalyticsOverview | null
  timeSeries: AnalyticsTimeSeries | null
  breakdowns: Record<string, AnalyticsBreakdown | AnalyticsBreakdownItem[] | null>
}

type AnalyticsBreakdownItem = import('~/types/domain').AnalyticsBreakdownItem

export function useAnalytics(scope: AnalyticsScope, organizationId?: MaybeRef<string | undefined>) {
  const api = useApiClient()
  const orgId = computed(() => unref(organizationId))

  function toQuery(filters?: AnalyticsFilters) {
    if (!filters) {
      return undefined
    }

    const query: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        query[key] = value
      }
    }

    return query
  }

  function getOverview(filters?: AnalyticsFilters) {
    if (scope === 'organization') {
      return api.get<AnalyticsOverview>(apiSpec.analytics.overview.path, {
        params: { organizationId: orgId.value! },
        query: toQuery(filters)
      })
    }

    return api.get<AnalyticsOverview>(apiSpec.admin.analyticsOverview.path, {
      query: toQuery(filters)
    })
  }

  function getTimeSeries(filters: AnalyticsFilters) {
    const query = toQuery(filters)

    if (scope === 'organization') {
      return api.get<AnalyticsTimeSeries>(apiSpec.analytics.timeSeries.path, {
        params: { organizationId: orgId.value! },
        query
      })
    }

    return api.get<AnalyticsTimeSeries>(apiSpec.admin.analyticsTimeSeries.path, {
      query
    })
  }

  function getBreakdown(key: string, filters?: AnalyticsFilters) {
    const query = toQuery(filters)

    if (scope === 'organization') {
      const orgEndpoints = {
        services: apiSpec.analytics.serviceBreakdown,
        consumers: apiSpec.analytics.consumerBreakdown,
        apiKeys: apiSpec.analytics.apiKeyBreakdown,
        methods: apiSpec.analytics.methodBreakdown,
        statusCodes: apiSpec.analytics.statusCodeBreakdown,
        topPaths: apiSpec.analytics.topPaths,
        slowestPaths: apiSpec.analytics.slowestPaths
      } as const

      const endpoint = orgEndpoints[key as keyof typeof orgEndpoints]
      if (!endpoint) {
        return Promise.resolve(null)
      }

      return api.get<AnalyticsBreakdown>(endpoint.path, {
        params: { organizationId: orgId.value! },
        query: key === 'topPaths' || key === 'slowestPaths'
          ? { ...query, limit: 10 }
          : query
      })
    }

    const platformEndpoints = {
      organizations: apiSpec.admin.analyticsOrganizationBreakdown,
      services: apiSpec.admin.analyticsServiceBreakdown,
      consumers: apiSpec.admin.analyticsConsumerBreakdown,
      apiKeys: apiSpec.admin.analyticsApiKeyBreakdown,
      statusCodes: apiSpec.admin.analyticsStatusCodeBreakdown,
      topPaths: apiSpec.admin.analyticsTopPaths,
      slowestPaths: apiSpec.admin.analyticsSlowestPaths
    } as const

    const endpoint = platformEndpoints[key as keyof typeof platformEndpoints]
    if (!endpoint) {
      return Promise.resolve(null)
    }

    return api.get<AnalyticsBreakdown>(endpoint.path, {
      query: key === 'topPaths' || key === 'slowestPaths'
        ? { ...query, limit: 10 }
        : query
    })
  }

  async function fetchDashboard(filters: AnalyticsFilters): Promise<AnalyticsDashboardData> {
    const timeSeriesFilters: AnalyticsFilters = {
      ...filters,
      bucket: filters.bucket ?? 'DAY'
    }

    const orgBreakdownKeys = ['services', 'consumers', 'apiKeys', 'methods', 'statusCodes', 'topPaths', 'slowestPaths']
    const platformBreakdownKeys = ['organizations', 'services', 'consumers', 'apiKeys', 'statusCodes', 'topPaths', 'slowestPaths']
    const breakdownKeys = scope === 'organization' ? orgBreakdownKeys : platformBreakdownKeys

    const settled = await Promise.allSettled([
      getOverview(filters),
      getTimeSeries(timeSeriesFilters),
      ...breakdownKeys.map(key => getBreakdown(key, filters))
    ])

    const overview = settled[0].status === 'fulfilled' ? settled[0].value : null
    const timeSeries = settled[1].status === 'fulfilled' ? settled[1].value : null

    const breakdowns: Record<string, AnalyticsBreakdown | AnalyticsBreakdownItem[] | null> = {}
    breakdownKeys.forEach((key, index) => {
      const result = settled[index + 2]
      breakdowns[key] = result?.status === 'fulfilled'
        ? (result.value as AnalyticsBreakdown | null)
        : null
    })

    return {
      overview,
      timeSeries,
      breakdowns
    }
  }

  return {
    getOverview,
    getTimeSeries,
    getBreakdown,
    fetchDashboard
  }
}
