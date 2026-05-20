export interface NormalizedApiError {
  statusCode: number
  message: string
  data?: unknown
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  const fetchError = error as {
    statusCode?: number
    status?: number
    statusMessage?: string
    message?: string
    data?: unknown
  }

  const statusCode = fetchError.statusCode ?? fetchError.status ?? 500
  const responseData = fetchError.data
  const responseMessage = responseData && typeof responseData === 'object' && 'message' in responseData
    && typeof (responseData as { message?: unknown }).message === 'string'
    ? (responseData as { message: string }).message
    : undefined

  return {
    statusCode,
    message: responseMessage ?? fetchError.statusMessage ?? fetchError.message ?? 'Request failed',
    data: responseData
  }
}

export function isUnauthorizedError(error: unknown): boolean {
  return normalizeApiError(error).statusCode === 401
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  return normalizeApiError(error).message || fallback
}

export function isEmailNotVerifiedError(error: unknown): boolean {
  const normalized = normalizeApiError(error)
  const message = normalized.message.toLowerCase()

  return (normalized.statusCode === 401 || normalized.statusCode === 403)
    && (message.includes('verify') || message.includes('verified') || message.includes('verification'))
}
