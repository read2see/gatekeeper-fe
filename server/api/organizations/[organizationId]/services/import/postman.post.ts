import type { PostmanImportResult } from '~/types/domain'

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

  const {
    defaultRequiredScope,
    serviceId,
    name,
    slug,
    baseUrl
  } = getQuery(event)

  if (!defaultRequiredScope || typeof defaultRequiredScope !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'defaultRequiredScope is required'
    })
  }

  const query: Record<string, unknown> = { defaultRequiredScope }

  if (typeof serviceId === 'string' && serviceId) {
    query.serviceId = serviceId
  }
  if (typeof name === 'string' && name) {
    query.name = name
  }
  if (typeof slug === 'string' && slug) {
    query.slug = slug
  }
  if (typeof baseUrl === 'string' && baseUrl) {
    query.baseUrl = baseUrl
  }

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find(part => part.filename && part.data)

  if (!filePart?.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'No Postman collection file uploaded'
    })
  }

  const formData = new FormData()
  const blob = new Blob([filePart.data], {
    type: filePart.type ?? 'application/json'
  })
  formData.append('file', blob, filePart.filename ?? 'collection.json')

  const result = await gatekeeperFetch<PostmanImportResult>(
    `/api/organizations/${organizationId}/services/import/postman`,
    {
      event,
      method: 'POST',
      query,
      body: formData
    }
  )

  return {
    data: result.data,
    message: result.message
  }
})
