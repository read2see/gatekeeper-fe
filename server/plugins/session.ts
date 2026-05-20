export default defineNitroPlugin(() => {
  sessionHooks.hook('fetch', async (session, event) => {
    if (!session.secure?.backendCookie) {
      return
    }

    try {
      const sessionPayload = await syncSessionFromBackend(session.secure.backendCookie)

      const nextSession = {
        user: sessionPayload.user,
        platformRoles: sessionPayload.platformRoles,
        organizations: sessionPayload.organizations,
        loggedInAt: session.loggedInAt ?? new Date().toISOString(),
        secure: session.secure
      }

      await replaceUserSession(event, nextSession)

      // session.get returns this object, not the cookie reread after the hook.
      session.user = nextSession.user
      session.platformRoles = nextSession.platformRoles
      session.organizations = nextSession.organizations
      session.loggedInAt = nextSession.loggedInAt
    } catch {
      await clearUserSession(event)
      throw createError({
        statusCode: 401,
        statusMessage: 'Session expired',
        message: 'Session expired'
      })
    }
  })

  sessionHooks.hook('clear', async (session) => {
    if (!session.secure?.backendCookie) {
      return
    }

    try {
      await gatekeeperFetchWithCookie('/api/auth/logout', session.secure.backendCookie, {
        method: 'POST'
      })
    } catch {
      // Best-effort backend logout during local session clear.
    }
  })
})
