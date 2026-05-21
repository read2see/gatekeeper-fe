import type { ApiResponse, HttpVerb } from '~/types/api-spec'
import { buildGatekeeperProxyUrl } from '~/utils/api-path'

type RequestOptions = {
  params?: Record<string, string | number | undefined>
  query?: Record<string, unknown>
  body?: unknown
  headers?: Record<string, string>
}

export function useApiClient() {
  const nuxtApp = useNuxtApp()
  const requestFetch = import.meta.server
    ? useRequestFetch()
    : nuxtApp.$apiFetch

  async function request<T>(
    apiPath: string,
    method: HttpVerb,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = buildGatekeeperProxyUrl(apiPath, options.params)

    const response = await requestFetch<ApiResponse<T>>(url, {
      method,
      query: options.query,
      body: options.body as BodyInit | Record<string, unknown> | null | undefined,
      headers: options.headers
    })

    return response.data
  }

  return {
    request,
    get<T>(apiPath: string, options?: Omit<RequestOptions, 'body'>) {
      return request<T>(apiPath, 'GET', options)
    },
    post<T>(apiPath: string, options?: RequestOptions) {
      return request<T>(apiPath, 'POST', options)
    },
    put<T>(apiPath: string, options?: RequestOptions) {
      return request<T>(apiPath, 'PUT', options)
    },
    patch<T>(apiPath: string, options?: RequestOptions) {
      return request<T>(apiPath, 'PATCH', options)
    },
    delete<T>(apiPath: string, options?: Omit<RequestOptions, 'body'>) {
      return request<T>(apiPath, 'DELETE', options)
    }
  }
}
