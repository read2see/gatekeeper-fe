export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const result = await gatekeeperFetch<unknown>('/api/users/me/avatar', {
    event,
    method: 'DELETE'
  })

  return {
    data: result.data,
    message: result.message
  }
})
