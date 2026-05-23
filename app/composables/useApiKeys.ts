import { apiSpec } from '~/types/api-spec'
import type {
  ApiKeyStatus,
  CreateApiKeyRequestBody,
  CreateApiRateLimitPolicyRequestBody,
  ListResponse,
  PageQuery,
  UpdateApiKeyScopesRequestBody,
  UpdateApiKeyStatusRequestBody,
  UpdateApiRateLimitPolicyRequestBody,
  UpdateApiRateLimitPolicyStatusRequestBody
} from '~/types/api-spec'
import type { ApiKey, RateLimitPolicy } from '~/types/domain'

export interface ApiKeyListQuery extends PageQuery {
  id?: string
  consumer_id?: string
  name?: string
  status?: ApiKeyStatus
  search?: string
}

export function useApiKeys(organizationId: string, serviceId: string) {
  const api = useApiClient()
  const params = { organizationId, serviceId }

  function listApiKeys(query?: ApiKeyListQuery) {
    return api.get<ListResponse<ApiKey>>(apiSpec.apiKeys.list.path, {
      params,
      query: query as Record<string, unknown> | undefined
    })
  }

  function getApiKey(keyId: string) {
    return api.get<ApiKey>(apiSpec.apiKeys.get.path, {
      params: { ...params, keyId }
    })
  }

  function createApiKey(body: CreateApiKeyRequestBody) {
    return api.post<ApiKey>(apiSpec.apiKeys.create.path, { params, body })
  }

  function updateApiKeyStatus(keyId: string, body: UpdateApiKeyStatusRequestBody) {
    return api.patch<ApiKey>(apiSpec.apiKeys.updateStatus.path, {
      params: { ...params, keyId },
      body
    })
  }

  function updateApiKeyScopes(keyId: string, body: UpdateApiKeyScopesRequestBody) {
    return api.patch<ApiKey>(apiSpec.apiKeys.updateScopes.path, {
      params: { ...params, keyId },
      body
    })
  }

  function getRateLimitPolicy(apiKeyId: string) {
    return api.get<RateLimitPolicy>(apiSpec.rateLimitPolicy.get.path, {
      params: { ...params, apiKeyId }
    })
  }

  function createRateLimitPolicy(apiKeyId: string, body: CreateApiRateLimitPolicyRequestBody) {
    return api.post<RateLimitPolicy>(apiSpec.rateLimitPolicy.create.path, {
      params: { ...params, apiKeyId },
      body
    })
  }

  function updateRateLimitPolicy(apiKeyId: string, body: UpdateApiRateLimitPolicyRequestBody) {
    return api.patch<RateLimitPolicy>(apiSpec.rateLimitPolicy.update.path, {
      params: { ...params, apiKeyId },
      body
    })
  }

  function updateRateLimitPolicyStatus(apiKeyId: string, body: UpdateApiRateLimitPolicyStatusRequestBody) {
    return api.patch<RateLimitPolicy>(apiSpec.rateLimitPolicy.updateStatus.path, {
      params: { ...params, apiKeyId },
      body
    })
  }

  function deleteRateLimitPolicy(apiKeyId: string) {
    return api.delete(apiSpec.rateLimitPolicy.delete.path, {
      params: { ...params, apiKeyId }
    })
  }

  return {
    listApiKeys,
    getApiKey,
    createApiKey,
    updateApiKeyStatus,
    updateApiKeyScopes,
    getRateLimitPolicy,
    createRateLimitPolicy,
    updateRateLimitPolicy,
    updateRateLimitPolicyStatus,
    deleteRateLimitPolicy
  }
}
