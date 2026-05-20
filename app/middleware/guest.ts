import { isGuestOnlyPath, resolvePostLoginRedirect } from '~/utils/redirect'

export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, session, ready, fetch } = useUserSession()

  if (!ready.value) {
    await fetch()
  }

  if (!loggedIn.value || !isGuestOnlyPath(to.path)) {
    return
  }

  return navigateTo(resolvePostLoginRedirect({
    platformRoles: session.value?.platformRoles,
    organizations: session.value?.organizations
  }))
})
