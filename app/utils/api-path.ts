export function interpolatePath(
  path: string,
  params?: Record<string, string | number | undefined>
): string {
  if (!params) {
    return path
  }

  return path.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key]
    if (value === undefined || value === null) {
      throw new Error(`Missing path parameter: ${key}`)
    }
    return encodeURIComponent(String(value))
  })
}

export function toGatekeeperProxyPath(apiPath: string): string {
  return apiPath.replace(/^\/?api\//, '')
}

export function buildGatekeeperProxyUrl(apiPath: string, params?: Record<string, string | number | undefined>): string {
  const interpolatedPath = interpolatePath(apiPath, params)
  const proxyPath = toGatekeeperProxyPath(interpolatedPath)
  return `/api/gatekeeper/${proxyPath}`
}
