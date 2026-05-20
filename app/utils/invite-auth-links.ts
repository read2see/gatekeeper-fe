import type { RouteLocationRaw } from 'vue-router'

type RouteQuery = Record<string, unknown>

export function resolveInviteTokenFromQuery(query: RouteQuery): string {
  if (typeof query.token === 'string') {
    return query.token
  }

  const redirect = typeof query.redirect === 'string' ? query.redirect : ''
  if (!redirect.startsWith('/auth/invite')) {
    return ''
  }

  try {
    const url = new URL(redirect, 'http://local')
    return url.searchParams.get('token') ?? ''
  } catch {
    return ''
  }
}

export function buildInviteRegisterLink(token: string): RouteLocationRaw {
  return {
    path: '/auth/register',
    query: { token }
  }
}

export function buildInviteLoginLink(token: string): RouteLocationRaw {
  const invitePath = `/auth/invite?token=${encodeURIComponent(token)}`

  return {
    path: '/auth/login',
    query: {
      token,
      redirect: invitePath
    }
  }
}

export function buildAuthCrossLinks(query: RouteQuery): {
  loginLink: RouteLocationRaw
  registerLink: RouteLocationRaw
} {
  const inviteToken = resolveInviteTokenFromQuery(query)

  if (inviteToken) {
    return {
      loginLink: buildInviteLoginLink(inviteToken),
      registerLink: buildInviteRegisterLink(inviteToken)
    }
  }

  return {
    loginLink: { path: '/auth/login' },
    registerLink: { path: '/auth/register' }
  }
}
