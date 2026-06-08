import { describe, it, expect } from 'vitest'
import { defineRouter, route, s } from '../src'

describe('Router', () => {
  it('defines routes with input and output', () => {
    const router = defineRouter({
      getUser: route({
        method: 'GET',
        path: '/users/:id',
        output: s.object({ id: s.string(), name: s.string() }),
      }),
      createUser: route({
        method: 'POST',
        path: '/users',
        input: s.object({ name: s.string() }),
        output: s.object({ id: s.string(), name: s.string() }),
      }),
    })

    expect(router.getUser.method).toBe('GET')
    expect(router.getUser.path).toBe('/users/:id')
    expect(router.createUser.method).toBe('POST')
    expect(router.createUser.input).toBeDefined()
  })

  it('route without input', () => {
    const r = route({
      method: 'GET',
      path: '/health',
      output: s.object({ status: s.string() }),
    })
    expect(r.method).toBe('GET')
    expect(r.input).toBeUndefined()
  })
})
