import type { H3Event } from 'h3'
import type { GatekeeperFetchOptions } from '../utils/gatekeeper'

export async function proxyPublicAuthRoute<T>(
  path: string,
  options: Omit<GatekeeperFetchOptions, 'event'> = {}
) {
  const result = await gatekeeperFetch<T>(path, options)

  return {
    data: result.data,
    message: result.message
  }
}

export async function proxyAuthenticatedAuthRoute<T>(
  event: H3Event,
  path: string,
  options: Omit<GatekeeperFetchOptions, 'event'> = {}
) {
  await requireUserSession(event)

  const result = await gatekeeperFetch<T>(path, {
    ...options,
    event
  })

  return {
    data: result.data,
    message: result.message
  }
}
