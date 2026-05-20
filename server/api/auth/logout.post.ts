export default defineEventHandler(async (event) => {
  try {
    await proxyAuthenticatedAuthRoute(event, '/api/auth/logout', {
      method: 'POST'
    })
  } catch {
    // Best-effort backend logout before clearing the local session.
  }

  await clearUserSession(event)

  return {
    data: null,
    message: 'Logged out'
  }
})
