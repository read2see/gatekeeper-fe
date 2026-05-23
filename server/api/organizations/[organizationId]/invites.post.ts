import type { CreateOrganizationInviteRequestBody } from '~/types/api-spec'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const organizationId = getRouterParam(event, 'organizationId')
  if (!organizationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Organization id is required'
    })
  }

  const body = await readBody<CreateOrganizationInviteRequestBody>(event)

  const result = await gatekeeperFetch<unknown>(
    `/api/organizations/${organizationId}/invites`,
    {
      event,
      method: 'POST',
      body
    }
  )

  return {
    data: result.data,
    message: result.message
  }
})
