import { apiSpec } from '~/types/api-spec'
import type {
  ApiServiceStatus,
  CreateApiServiceRequestBody,
  ListResponse,
  PageQuery,
  UpdateApiServiceRequestBody,
  UpdateApiServiceStatusRequestBody
} from '~/types/api-spec'
import type { ApiService } from '~/types/domain'

export interface ServiceListQuery extends PageQuery {
  id?: string
  name?: string
  slug?: string
  status?: ApiServiceStatus
  include_archived?: boolean
  search?: string
}

export function useServices(organizationId: string) {
  const api = useApiClient()
  const params = { organizationId }

  function listServices(query?: ServiceListQuery) {
    return api.get<ListResponse<ApiService>>(apiSpec.services.list.path, {
      params,
      query: query as Record<string, unknown> | undefined
    })
  }

  function getService(serviceId: string) {
    return api.get<ApiService>(apiSpec.services.get.path, {
      params: { ...params, serviceId }
    })
  }

  function createService(body: CreateApiServiceRequestBody) {
    return api.post<ApiService>(apiSpec.services.create.path, { params, body })
  }

  function updateService(serviceId: string, body: UpdateApiServiceRequestBody) {
    return api.patch<ApiService>(apiSpec.services.update.path, {
      params: { ...params, serviceId },
      body
    })
  }

  function updateServiceStatus(serviceId: string, body: UpdateApiServiceStatusRequestBody) {
    return api.patch<ApiService>(apiSpec.services.updateStatus.path, {
      params: { ...params, serviceId },
      body
    })
  }

  function deleteService(serviceId: string) {
    return api.delete(apiSpec.services.delete.path, {
      params: { ...params, serviceId }
    })
  }

  return {
    listServices,
    getService,
    createService,
    updateService,
    updateServiceStatus,
    deleteService
  }
}
