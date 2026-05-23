export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find(part => part.filename && part.data)

  if (!filePart?.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'No image file uploaded'
    })
  }

  const formData = new FormData()
  const blob = new Blob([filePart.data], {
    type: filePart.type ?? 'application/octet-stream'
  })
  formData.append('file', blob, filePart.filename ?? 'avatar')

  const result = await gatekeeperFetch<unknown>('/api/users/me/avatar', {
    event,
    method: 'PUT',
    body: formData
  })

  return {
    data: result.data,
    message: result.message
  }
})
