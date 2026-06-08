export interface Schema<T> {
  readonly _type: T
  parse(value: unknown): T
}

function createSchema<T>(parse: (value: unknown) => T): Schema<T> {
  return { _type: undefined as unknown as T, parse }
}

export type Infer<S> = S extends Schema<infer T> ? T : never

export type ObjectShape = Record<string, Schema<unknown>>
export type InferObject<S extends ObjectShape> = { [K in keyof S]: Infer<S[K]> }

export const s = {
  string(): Schema<string> {
    return createSchema((v) => {
      if (typeof v !== 'string') throw new TypeError(`Expected string, got ${typeof v}`)
      return v
    })
  },

  number(): Schema<number> {
    return createSchema((v) => {
      if (typeof v !== 'number') throw new TypeError(`Expected number, got ${typeof v}`)
      return v
    })
  },

  boolean(): Schema<boolean> {
    return createSchema((v) => {
      if (typeof v !== 'boolean') throw new TypeError(`Expected boolean, got ${typeof v}`)
      return v
    })
  },

  literal<T extends string | number | boolean>(expected: T): Schema<T> {
    return createSchema((v) => {
      if (v !== expected) throw new TypeError(`Expected ${String(expected)}, got ${String(v)}`)
      return v as T
    })
  },

  object<S extends ObjectShape>(shape: S): Schema<InferObject<S>> {
    return createSchema((v) => {
      if (typeof v !== 'object' || v === null || Array.isArray(v)) {
        throw new TypeError(`Expected object, got ${typeof v}`)
      }
      const result: Record<string, unknown> = {}
      for (const [key, schema] of Object.entries(shape)) {
        result[key] = schema.parse((v as Record<string, unknown>)[key])
      }
      return result as InferObject<S>
    })
  },

  array<T>(itemSchema: Schema<T>): Schema<T[]> {
    return createSchema((v) => {
      if (!Array.isArray(v)) throw new TypeError(`Expected array, got ${typeof v}`)
      return v.map((item) => itemSchema.parse(item))
    })
  },

  optional<T>(schema: Schema<T>): Schema<T | undefined> {
    return createSchema((v) => {
      if (v === undefined || v === null) return undefined
      return schema.parse(v)
    })
  },
}
