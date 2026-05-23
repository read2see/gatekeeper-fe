export interface PostmanPreview {
  name?: string
  baseUrl?: string
  requestCount: number
  error?: string
}

export const POSTMAN_ACCEPT = 'application/json,.json'
export const POSTMAN_MAX_BYTES = 5 * 1024 * 1024

export function validatePostmanFile(file: File): string | null {
  const isJsonType = file.type === 'application/json' || file.type === ''
  const isJsonName = file.name.toLowerCase().endsWith('.json')

  if (!isJsonType && !isJsonName) {
    return 'Please choose a Postman collection JSON file.'
  }

  if (file.size > POSTMAN_MAX_BYTES) {
    return 'Collection file must be 5 MB or smaller.'
  }

  return null
}

export function parsePostmanPreview(json: unknown): PostmanPreview {
  if (!json || typeof json !== 'object') {
    return { requestCount: 0, error: 'Invalid Postman collection format.' }
  }

  const collection = json as Record<string, unknown>

  if (!Array.isArray(collection.item)) {
    return { requestCount: 0, error: 'Invalid Postman collection format.' }
  }

  const requestCount = countRequests(collection.item)

  return {
    name: extractCollectionName(collection),
    baseUrl: extractBaseUrl(collection),
    requestCount
  }
}

function extractCollectionName(collection: Record<string, unknown>): string | undefined {
  const info = collection.info
  if (!info || typeof info !== 'object') {
    return undefined
  }

  const name = (info as Record<string, unknown>).name
  if (typeof name !== 'string') {
    return undefined
  }

  const trimmed = name.trim()
  return trimmed || undefined
}

function extractBaseUrl(collection: Record<string, unknown>): string | undefined {
  const variables = collection.variable
  if (!Array.isArray(variables)) {
    return undefined
  }

  for (const variable of variables) {
    if (!variable || typeof variable !== 'object') {
      continue
    }

    const entry = variable as Record<string, unknown>
    if (entry.key !== 'baseUrl' || typeof entry.value !== 'string') {
      continue
    }

    const trimmed = entry.value.trim()
    if (trimmed) {
      return trimmed
    }
  }

  return undefined
}

function countRequests(items: unknown): number {
  if (!Array.isArray(items)) {
    return 0
  }

  let count = 0

  for (const entry of items) {
    if (!entry || typeof entry !== 'object') {
      continue
    }

    const item = entry as Record<string, unknown>

    if (item.request) {
      count += 1
      continue
    }

    if (Array.isArray(item.item)) {
      count += countRequests(item.item)
    }
  }

  return count
}
