declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    full_name: string
    email_verified: boolean
    has_avatar?: boolean
  }

  interface UserSession {
    platformRoles: string[]
    organizations: Array<{ id: string; name: string; slug: string; role_code: string }>
    loggedInAt: string
  }

  interface SecureSessionData {
    backendCookie: string
  }
}

export {}
