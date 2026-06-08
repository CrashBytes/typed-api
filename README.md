# typed-api

[![npm version](https://img.shields.io/npm/v/@crashbytes/typed-api.svg)](https://www.npmjs.com/package/@crashbytes/typed-api)
[![license](https://img.shields.io/npm/l/@crashbytes/typed-api.svg)](https://github.com/CrashBytes/typed-api/blob/main/LICENSE)

Type-safe API client builder with full TypeScript inference. Define routes with schemas, get compile-time safety. Zero dependencies.

**npm:** [https://www.npmjs.com/package/@crashbytes/typed-api](https://www.npmjs.com/package/@crashbytes/typed-api)

## Why typed-api?

Building API clients usually means one of two things: writing verbose, repetitive fetch calls with manual type annotations, or pulling in heavyweight code-generation tools. Both approaches have drawbacks -- manual clients drift out of sync with your API, and codegen adds build complexity and dependencies.

typed-api takes a different approach. You define your API routes once with lightweight schemas, and the TypeScript compiler infers everything -- request types, response types, and method signatures. No code generation, no heavy dependencies, no runtime overhead beyond a thin fetch wrapper.

### What you get

- **Full type inference.** Input and output types are inferred from your schema definitions. Your editor autocompletes request bodies and response shapes.
- **Runtime validation.** Inputs are validated before sending, outputs are validated after receiving. Malformed data is caught immediately.
- **Zero dependencies.** The entire library is self-contained. No Zod, no Axios, no generated code.
- **Tiny footprint.** A lightweight schema layer and a thin client builder. Nothing more.

## Install

```bash
npm install @crashbytes/typed-api
```

## Quick Start

```typescript
import { createClient, defineRouter, route, s } from '@crashbytes/typed-api'

// 1. Define your API routes with schemas
const router = defineRouter({
  getUser: route({
    method: 'GET',
    path: '/users/:id',
    output: s.object({
      id: s.string(),
      name: s.string(),
      email: s.string(),
    }),
  }),
  createUser: route({
    method: 'POST',
    path: '/users',
    input: s.object({
      name: s.string(),
      email: s.string(),
    }),
    output: s.object({
      id: s.string(),
      name: s.string(),
      email: s.string(),
    }),
  }),
  listUsers: route({
    method: 'GET',
    path: '/users',
    output: s.array(
      s.object({
        id: s.string(),
        name: s.string(),
      }),
    ),
  }),
  deleteUser: route({
    method: 'DELETE',
    path: '/users/:id',
    output: s.object({ ok: s.boolean() }),
  }),
})

// 2. Create a type-safe client
const api = createClient(router, {
  baseUrl: 'https://api.example.com',
  headers: {
    Authorization: 'Bearer my-token',
  },
})

// 3. Use it -- everything is fully typed
const user = await api.createUser({ name: 'Alice', email: 'alice@example.com' })
// user: { id: string, name: string, email: string }

const users = await api.listUsers()
// users: { id: string, name: string }[]

const health = await api.getUser()
// No input required -- TypeScript knows this route has no input schema
```

## Schema Types

The `s` object provides lightweight schema builders for defining input and output shapes:

| Builder | Type | Description |
|---------|------|-------------|
| `s.string()` | `string` | Validates strings |
| `s.number()` | `number` | Validates numbers |
| `s.boolean()` | `boolean` | Validates booleans |
| `s.literal(value)` | literal type | Validates exact value match |
| `s.object(shape)` | `{ ... }` | Validates object with typed fields |
| `s.array(schema)` | `T[]` | Validates array of items |
| `s.optional(schema)` | `T \| undefined` | Makes a schema optional |

### Type Inference

Use the `Infer` type helper to extract the TypeScript type from any schema:

```typescript
import { s, type Infer } from '@crashbytes/typed-api'

const UserSchema = s.object({
  id: s.string(),
  name: s.string(),
  age: s.number(),
  admin: s.boolean(),
  tags: s.array(s.string()),
  nickname: s.optional(s.string()),
})

type User = Infer<typeof UserSchema>
// { id: string; name: string; age: number; admin: boolean; tags: string[]; nickname: string | undefined }
```

## Error Handling

The client throws `ApiError` for non-2xx responses:

```typescript
import { createClient, ApiError } from '@crashbytes/typed-api'

try {
  const user = await api.getUser()
} catch (err) {
  if (err instanceof ApiError) {
    console.error(err.status) // HTTP status code
    console.error(err.body)   // Response body
  }
}
```

Schema validation errors throw `TypeError` for invalid inputs or outputs:

```typescript
// Input validation -- throws before the request is sent
await api.createUser({ name: 123 }) // TypeError: Expected string, got number

// Output validation -- throws after receiving malformed response
// If the server returns { status: 123 } instead of { status: "ok" }
// TypeError: Expected string, got number
```

## API Reference

### `s.string()` / `s.number()` / `s.boolean()`

Create primitive schemas with runtime type checking.

### `s.literal(value)`

Create a schema that matches an exact value.

```typescript
const role = s.literal('admin')
role.parse('admin') // 'admin'
role.parse('user')  // throws TypeError
```

### `s.object(shape)`

Create an object schema from a shape of named schemas.

```typescript
const user = s.object({ name: s.string(), age: s.number() })
user.parse({ name: 'Alice', age: 30 }) // { name: 'Alice', age: 30 }
```

### `s.array(schema)`

Create an array schema that validates each item.

```typescript
const nums = s.array(s.number())
nums.parse([1, 2, 3]) // [1, 2, 3]
```

### `s.optional(schema)`

Wrap a schema to accept `undefined` or `null` (returns `undefined`).

```typescript
const maybe = s.optional(s.string())
maybe.parse('hello')    // 'hello'
maybe.parse(undefined)  // undefined
maybe.parse(null)       // undefined
```

### `route(config)`

Define a single API route with method, path, optional input schema, and output schema.

### `defineRouter(routes)`

Group routes into a router object. Returns the routes with full type information preserved.

### `createClient(router, options)`

Create a type-safe client from a router definition.

Options:
- `baseUrl` -- Base URL for all requests
- `headers` -- Default headers included in every request
- `fetch` -- Custom fetch implementation (defaults to `globalThis.fetch`)

### `ApiError`

Error class thrown for non-2xx HTTP responses.

Properties:
- `status` -- HTTP status code
- `body` -- Response body (parsed from text)
- `message` -- `"API error {status}"`

## License

MIT
