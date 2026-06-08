import type { HttpMethod } from './types'
import type { Schema } from './schema'

export interface RouteConfig<
  TInput extends Schema<unknown> | undefined,
  TOutput extends Schema<unknown>,
> {
  method: HttpMethod
  path: string
  input?: TInput
  output: TOutput
}

export type RouterRoutes = Record<string, RouteConfig<Schema<unknown> | undefined, Schema<unknown>>>

export function defineRouter<T extends RouterRoutes>(routes: T): T {
  return routes
}

export function route<
  TOutput extends Schema<unknown>,
>(config: { method: HttpMethod; path: string; output: TOutput }): RouteConfig<undefined, TOutput>
export function route<
  TInput extends Schema<unknown>,
  TOutput extends Schema<unknown>,
>(config: { method: HttpMethod; path: string; input: TInput; output: TOutput }): RouteConfig<TInput, TOutput>
export function route(config: { method: HttpMethod; path: string; input?: Schema<unknown>; output: Schema<unknown> }) {
  return config
}
