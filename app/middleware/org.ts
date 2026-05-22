export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()

  if (!auth.ready.value) {
    await auth.fetch()
  }

  const organizationId = to.params.organizationId
  if (typeof organizationId !== 'string' || !organizationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Organization id is required'
    })
  }

  if (auth.getOrgRole(organizationId)) {
    return
  }

  await auth.fetch()

  if (auth.getOrgRole(organizationId)) {
    return
  }

  if (auth.isPlatformStaff.value) {
    return
  }

  throw createError({
    statusCode: 403,
    statusMessage: 'Forbidden',
    message: 'You are not a member of this organization'
  })
})
