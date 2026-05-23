export function buildAvatarUrl(userId: string, apiBase: string, version?: string | number) {
  const base = apiBase.replace(/\/$/, '')
  const query = version !== undefined ? `?v=${encodeURIComponent(String(version))}` : ''
  return `${base}/api/users/${userId}/avatar${query}`
}

export function getAvatarInitials(fullName?: string | null, email?: string | null) {
  const name = fullName?.trim()
  if (name) {
    return name
      .split(/\s+/)
      .map(part => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  const address = email?.trim()
  if (address) {
    return address.charAt(0).toUpperCase()
  }

  return '?'
}

export const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024

export function validateAvatarFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Please choose an image file.'
  }

  if (file.size > AVATAR_MAX_BYTES) {
    return 'Image must be 2 MB or smaller.'
  }

  return null
}
