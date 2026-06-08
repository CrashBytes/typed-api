import { describe, it, expect, vi } from 'vitest'
import { createClient, defineRouter, route, s, ApiError } from '../src'

function mockFetch(data: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  })
}

describe('Client', () => {
  const router = defineRouter({
    getHealth: route({
      method: 'GET',
      path: '/health',
      output: s.object({ status: s.string() }),
    }),
    createUser: route({
      method: 'POST',
      path: '/users',
      input: s.object({ name: s.string() }),
      output: s.object({ id: s.string(), name: s.string() }),
    }),
    deleteUser: route({
      method: 'DELETE',
      path: '/users/:id',
      output: s.object({ ok: s.boolean() }),
    }),
  })

  it('makes GET request without input', async () => {
    const fetch = mockFetch({ status: 'ok' })
    const client = createClient(router, { baseUrl: 'http://api.test', fetch })

    const result = await client.getHealth()
    expect(result).toEqual({ status: 'ok' })
    expect(fetch).toHaveBeenCalledWith('http://api.test/health', expect.objectContaining({ method: 'GET' }))
  })

  it('makes POST request with body', async () => {
    const fetch = mockFetch({ id: '1', name: 'Alice' })
    const client = createClient(router, { baseUrl: 'http://api.test', fetch })

    const result = await client.createUser({ name: 'Alice' })
    expect(result).toEqual({ id: '1', name: 'Alice' })
    expect(fetch).toHaveBeenCalledWith(
      'http://api.test/users',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Alice' }),
      }),
    )
  })

  it('throws ApiError on non-ok response', async () => {
    const fetch = mockFetch({ error: 'not found' }, 404)
    const client = createClient(router, { baseUrl: 'http://api.test', fetch })

    await expect(client.getHealth()).rejects.toThrow(ApiError)
    try {
      await client.getHealth()
    } catch (e) {
      expect((e as ApiError).status).toBe(404)
    }
  })

  it('validates input against schema', async () => {
    const fetch = mockFetch({ id: '1', name: 'Alice' })
    const client = createClient(router, { baseUrl: 'http://api.test', fetch })

    await expect(
      (client.createUser as (input: unknown) => Promise<unknown>)({ name: 123 })
    ).rejects.toThrow('Expected string')
  })

  it('validates output against schema', async () => {
    const fetch = mockFetch({ status: 123 }) // number instead of string
    const client = createClient(router, { baseUrl: 'http://api.test', fetch })

    await expect(client.getHealth()).rejects.toThrow('Expected string')
  })

  it('passes custom headers', async () => {
    const fetch = mockFetch({ status: 'ok' })
    const client = createClient(router, {
      baseUrl: 'http://api.test',
      fetch,
      headers: { Authorization: 'Bearer token' },
    })

    await client.getHealth()
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer token' }),
      }),
    )
  })
})
