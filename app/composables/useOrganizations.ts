import { apiSpec } from '~/types/api-spec'
import type {
  CreateOrganizationRequestBody,
  ListResponse,
  OrganizationStatus,
  PageQuery,
  UpdateOrganizationRequestBody
} from '~/types/api-spec'
import type { Organization } from '~/types/domain'

export interface OrganizationListQuery extends PageQuery {
  id?: string
  name?: string
  slug?: string
  status?: OrganizationStatus
  role_code?: string
  search?: string
}

export function useOrganizations() {
  const api = useApiClient()

  function listOrganizations(query?: OrganizationListQuery) {
    return api.get<ListResponse<Organization>>(apiSpec.organizations.list.path, {
      query: query as Record<string, unknown> | undefined
    })
  }

  function getOrganization(organizationId: string) {
    return api.get<Organization>(apiSpec.organizations.get.path, {
      params: { organizationId }
    })
  }

  function createOrganization(body: CreateOrganizationRequestBody) {
    return api.post<Organization>(apiSpec.organizations.create.path, { body })
  }

  function updateOrganization(organizationId: string, body: UpdateOrganizationRequestBody) {
    return api.patch<Organization>(apiSpec.organizations.update.path, {
      params: { organizationId },
      body
    })
  }

  function deleteOrganization(organizationId: string) {
    return api.delete(apiSpec.organizations.delete.path, {
      params: { organizationId }
    })
  }

  return {
    listOrganizations,
    getOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization
  }
}
