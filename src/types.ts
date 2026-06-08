import type { Schema, Infer } from './schema'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RouteDefinition<
  TInput extends Schema<unknown> | undefined = undefined,
  TOutput extends Schema<unknown> = Schema<unknown>,
> {
  method: HttpMethod
  path: string
  input?: TInput
  output: TOutput
}

export type RoutesMap = Record<string, RouteDefinition<Schema<unknown> | undefined, Schema<unknown>>>

export type ClientOptions = {
  baseUrl: string
  headers?: Record<string, string>
  fetch?: typeof globalThis.fetch
}

export type RouteInput<R extends RouteDefinition<Schema<unknown> | undefined, Schema<unknown>>> =
  R['input'] extends Schema<unknown> ? Infer<R['input']> : void

export type RouteOutput<R extends RouteDefinition<Schema<unknown> | undefined, Schema<unknown>>> =
  Infer<R['output']>

export type TypedClient<T extends RoutesMap> = {
  [K in keyof T]: RouteInput<T[K]> extends void
    ? () => Promise<RouteOutput<T[K]>>
    : (input: RouteInput<T[K]>) => Promise<RouteOutput<T[K]>>
}
