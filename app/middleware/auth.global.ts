import { requiresAuthentication } from '~/utils/redirect'

export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, ready, fetch } = useUserSession()

  if (!ready.value) {
    await fetch()
  }

  if (!requiresAuthentication(to.path) || loggedIn.value) {
    return
  }

  return navigateTo({
    path: '/auth/login',
    query: {
      redirect: to.fullPath
    }
  })
})
