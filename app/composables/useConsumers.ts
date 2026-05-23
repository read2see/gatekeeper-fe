import { apiSpec } from '~/types/api-spec'
import type {
  ApiConsumerStatus,
  ApiConsumerType,
  CreateApiConsumerRequestBody,
  ListResponse,
  PageQuery,
  UpdateApiConsumerRequestBody,
  UpdateApiConsumerStatusRequestBody
} from '~/types/api-spec'
import type { ApiConsumer } from '~/types/domain'

export interface ConsumerListQuery extends PageQuery {
  id?: string
  name?: string
  type?: ApiConsumerType
  status?: ApiConsumerStatus
  include_archived?: boolean
  search?: string
}

export function useConsumers(organizationId: string) {
  const api = useApiClient()
  const params = { organizationId }

  function listConsumers(query?: ConsumerListQuery) {
    return api.get<ListResponse<ApiConsumer>>(apiSpec.consumers.list.path, {
      params,
      query: query as Record<string, unknown> | undefined
    })
  }

  function getConsumer(consumerId: string) {
    return api.get<ApiConsumer>(apiSpec.consumers.get.path, {
      params: { ...params, consumerId }
    })
  }

  function createConsumer(body: CreateApiConsumerRequestBody) {
    return api.post<ApiConsumer>(apiSpec.consumers.create.path, { params, body })
  }

  function updateConsumer(consumerId: string, body: UpdateApiConsumerRequestBody) {
    return api.patch<ApiConsumer>(apiSpec.consumers.update.path, {
      params: { ...params, consumerId },
      body
    })
  }

  function updateConsumerStatus(consumerId: string, body: UpdateApiConsumerStatusRequestBody) {
    return api.patch<ApiConsumer>(apiSpec.consumers.updateStatus.path, {
      params: { ...params, consumerId },
      body
    })
  }

  function deleteConsumer(consumerId: string) {
    return api.delete<ApiConsumer>(apiSpec.consumers.delete.path, {
      params: { ...params, consumerId }
    })
  }

  return {
    listConsumers,
    getConsumer,
    createConsumer,
    updateConsumer,
    updateConsumerStatus,
    deleteConsumer
  }
}
