const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.'

let handlingUnauthorized = false

export function useUnauthorizedHandler() {
  const { clear } = useUserSession()
  const route = useRoute()

  async function handleUnauthorized() {
    if (import.meta.server || handlingUnauthorized) {
      return
    }

    handlingUnauthorized = true

    try {
      await clear()
    } catch {
      // Session may already be cleared by the server.
    }

    if (!route.path.startsWith('/auth/')) {
      await navigateTo({
        path: '/auth/login',
        query: {
          redirect: route.fullPath,
          reason: 'session_expired'
        }
      })
    }
  }

  return {
    handleUnauthorized,
    sessionExpiredMessage: SESSION_EXPIRED_MESSAGE
  }
}
