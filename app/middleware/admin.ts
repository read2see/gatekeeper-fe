export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuth()

  if (!auth.ready.value) {
    await auth.fetch()
  }

  if (!auth.isPlatformStaff.value) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Platform staff access is required'
    })
  }
})
