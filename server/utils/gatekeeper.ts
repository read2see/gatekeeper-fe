import type { H3Event } from 'h3'
import type { FetchError } from 'ofetch'

export interface GatekeeperFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'
  body?: unknown
  query?: Record<string, unknown>
  headers?: Record<string, string>
  captureCookie?: boolean
  event?: H3Event
}

export interface GatekeeperFetchResult<T> {
  data: T
  message?: string
  backendCookie?: string
}

export interface GatekeeperErrorData {
  statusCode: number
  message: string
  data?: unknown
}

function getGatekeeperBaseUrl(): string {
  const config = useRuntimeConfig()
  return config.gatekeeperApiBase
}

export function extractSetCookieHeader(response: Response): string | undefined {
  if (typeof response.headers.getSetCookie === 'function') {
    const cookies = response.headers.getSetCookie()
    if (cookies.length > 0) {
      return cookies.map(cookie => cookie.split(';')[0]).join('; ')
    }
  }

  const setCookie = response.headers.get('set-cookie')
  if (!setCookie) {
    return undefined
  }

  return setCookie
    .split(/,(?=\s*[^;]+=[^;]+)/)
    .map(cookie => cookie.split(';')[0]?.trim())
    .filter(Boolean)
    .join('; ')
}

export function mapGatekeeperError(error: unknown): GatekeeperErrorData {
  const fetchError = error as FetchError<{ message?: string, data?: unknown }>
  const statusCode = fetchError.statusCode ?? fetchError.response?.status ?? 500
  const responseData = fetchError.data ?? fetchError.response?._data
  const message
    = (responseData && typeof responseData === 'object' && 'message' in responseData && typeof responseData.message === 'string'
      ? responseData.message
      : undefined)
    ?? fetchError.statusMessage
    ?? fetchError.message
    ?? 'Request failed'

  return {
    statusCode,
    message,
    data: responseData
  }
}

export function throwGatekeeperError(error: unknown): never {
  const mapped = mapGatekeeperError(error)

  throw createError({
    statusCode: mapped.statusCode,
    statusMessage: mapped.message,
    message: mapped.message,
    data: mapped.data
  })
}

async function buildRequestHeaders(options: GatekeeperFetchOptions): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    accept: 'application/json',
    ...options.headers
  }

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers['content-type'] = 'application/json'
  }

  if (options.headers?.cookie) {
    headers.cookie = options.headers.cookie
  } else if (options.event) {
    const session = await getUserSession(options.event)
    if (session.secure?.backendCookie) {
      headers.cookie = session.secure.backendCookie
    }
  }

  return headers
}

export async function gatekeeperFetch<T>(
  path: string,
  options: GatekeeperFetchOptions = {}
): Promise<GatekeeperFetchResult<T>> {
  const baseUrl = getGatekeeperBaseUrl()
  const headers = await buildRequestHeaders(options)

  try {
    const response = await $fetch.raw(`${baseUrl}${path}`, {
      method: options.method ?? 'GET',
      body: options.body as BodyInit | Record<string, unknown> | null | undefined,
      query: options.query,
      headers
    })

    const payload = response._data as { data?: T, message?: string } | T
    const data = payload && typeof payload === 'object' && 'data' in payload
      ? payload.data as T
      : payload as T
    const message = payload && typeof payload === 'object' && 'message' in payload
      ? payload.message
      : undefined

    return {
      data,
      message,
      backendCookie: options.captureCookie
        ? extractSetCookieHeader(response)
        : undefined
    }
  } catch (error) {
    throwGatekeeperError(error)
  }
}

export async function gatekeeperFetchWithCookie<T>(
  path: string,
  backendCookie: string,
  options: Omit<GatekeeperFetchOptions, 'event' | 'headers'> = {}
): Promise<GatekeeperFetchResult<T>> {
  return gatekeeperFetch<T>(path, {
    ...options,
    headers: { cookie: backendCookie }
  })
}
