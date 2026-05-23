import { apiSpec } from '~/types/api-spec'
import type { HttpMethod, ListResponse, UsageLogQuery } from '~/types/api-spec'
import type { UsageLog } from '~/types/domain'

export interface OrgUsageLogListQuery extends UsageLogQuery {
  method?: HttpMethod
}

export function useUsageLogs(organizationId: string) {
  const api = useApiClient()
  const params = { organizationId }

  function listUsageLogs(query?: OrgUsageLogListQuery) {
    return api.get<ListResponse<UsageLog>>(apiSpec.usageLogs.list.path, {
      params,
      query: query as Record<string, unknown> | undefined
    })
  }

  function getUsageLog(logId: string) {
    return api.get<UsageLog>(apiSpec.usageLogs.get.path, {
      params: { ...params, logId }
    })
  }

  return {
    listUsageLogs,
    getUsageLog
  }
}
