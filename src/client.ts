import type { ClientOptions, TypedClient, RoutesMap } from './types'
import type { RouterRoutes } from './router'

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown) {
    super(`API error ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export function createClient<T extends RouterRoutes>(
  routes: T,
  options: ClientOptions,
): TypedClient<T & RoutesMap> {
  const fetchFn = options.fetch ?? globalThis.fetch

  const client: Record<string, (input?: unknown) => Promise<unknown>> = {}

  for (const [name, route] of Object.entries(routes)) {
    client[name] = async (input?: unknown) => {
      const hasBody = route.method !== 'GET' && route.method !== 'DELETE'
      const url = `${options.baseUrl}${route.path}`

      let finalUrl = url
      const init: RequestInit = {
        method: route.method,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      }

      if (input !== undefined) {
        if (route.input) {
          route.input.parse(input)
        }

        if (hasBody) {
          init.body = JSON.stringify(input)
        } else {
          const params = new URLSearchParams()
          for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
            if (v !== undefined) params.set(k, String(v))
          }
          const qs = params.toString()
          if (qs) finalUrl = `${url}?${qs}`
        }
      }

      const response = await fetchFn(finalUrl, init)

      if (!response.ok) {
        const body = await response.text().catch(() => null)
        throw new ApiError(response.status, body)
      }

      const data = await response.json()
      return route.output.parse(data)
    }
  }

  return client as TypedClient<T & RoutesMap>
}
