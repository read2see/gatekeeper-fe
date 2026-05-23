import { apiSpec } from '~/types/api-spec'
import type {
  CreateRouteRuleRequestBody,
  HttpMethod,
  ListResponse,
  PageQuery,
  UpdateRouteRuleRequestBody,
  UpdateRouteRuleStatusRequestBody
} from '~/types/api-spec'
import type { RouteRule } from '~/types/domain'

export interface RouteRuleListQuery extends PageQuery {
  id?: string
  method?: HttpMethod
  pathPattern?: string
  requiredScope?: string
  active?: boolean
  search?: string
}

export function useRouteRules(organizationId: string, serviceId: string) {
  const api = useApiClient()
  const params = { organizationId, serviceId }

  function listRouteRules(query?: RouteRuleListQuery) {
    return api.get<ListResponse<RouteRule>>(apiSpec.routeRules.list.path, {
      params,
      query: query as Record<string, unknown> | undefined
    })
  }

  function getRouteRule(routeRuleId: string) {
    return api.get<RouteRule>(apiSpec.routeRules.get.path, {
      params: { ...params, routeRuleId }
    })
  }

  function createRouteRule(body: CreateRouteRuleRequestBody) {
    return api.post<RouteRule>(apiSpec.routeRules.create.path, { params, body })
  }

  function updateRouteRule(routeRuleId: string, body: UpdateRouteRuleRequestBody) {
    return api.patch<RouteRule>(apiSpec.routeRules.update.path, {
      params: { ...params, routeRuleId },
      body
    })
  }

  function updateRouteRuleStatus(routeRuleId: string, body: UpdateRouteRuleStatusRequestBody) {
    return api.patch<RouteRule>(apiSpec.routeRules.updateStatus.path, {
      params: { ...params, routeRuleId },
      body
    })
  }

  function deleteRouteRule(routeRuleId: string) {
    return api.delete(apiSpec.routeRules.delete.path, {
      params: { ...params, routeRuleId }
    })
  }

  return {
    listRouteRules,
    getRouteRule,
    createRouteRule,
    updateRouteRule,
    updateRouteRuleStatus,
    deleteRouteRule
  }
}
