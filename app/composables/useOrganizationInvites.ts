import { apiSpec } from '~/types/api-spec'
import type { ApiResponse, CreateOrganizationInviteRequestBody } from '~/types/api-spec'
import type { OrganizationInviteResult } from '~/types/domain'
import { interpolatePath } from '~/utils/api-path'

export function useOrganizationInvites(organizationId: string) {
  function createInvite(body: CreateOrganizationInviteRequestBody) {
    const path = interpolatePath(apiSpec.organizationInvites.create.path, { organizationId })

    return $fetch<ApiResponse<OrganizationInviteResult>>(path, {
      method: apiSpec.organizationInvites.create.method,
      body
    }).then(response => response.data)
  }

  return {
    createInvite
  }
}
