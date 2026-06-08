import { describe, it, expect } from 'vitest'
import { s } from '../src'

describe('Schema', () => {
  describe('s.string()', () => {
    it('parses valid string', () => {
      expect(s.string().parse('hello')).toBe('hello')
    })
    it('rejects non-string', () => {
      expect(() => s.string().parse(42)).toThrow('Expected string')
    })
  })

  describe('s.number()', () => {
    it('parses valid number', () => {
      expect(s.number().parse(42)).toBe(42)
    })
    it('rejects non-number', () => {
      expect(() => s.number().parse('42')).toThrow('Expected number')
    })
  })

  describe('s.boolean()', () => {
    it('parses valid boolean', () => {
      expect(s.boolean().parse(true)).toBe(true)
    })
    it('rejects non-boolean', () => {
      expect(() => s.boolean().parse(1)).toThrow('Expected boolean')
    })
  })

  describe('s.literal()', () => {
    it('parses matching literal', () => {
      expect(s.literal('admin').parse('admin')).toBe('admin')
    })
    it('rejects non-matching', () => {
      expect(() => s.literal('admin').parse('user')).toThrow('Expected admin')
    })
  })

  describe('s.object()', () => {
    it('parses valid object', () => {
      const schema = s.object({ name: s.string(), age: s.number() })
      expect(schema.parse({ name: 'Alice', age: 30 })).toEqual({ name: 'Alice', age: 30 })
    })
    it('rejects non-object', () => {
      expect(() => s.object({}).parse('x')).toThrow('Expected object')
    })
    it('rejects null', () => {
      expect(() => s.object({}).parse(null)).toThrow('Expected object')
    })
    it('rejects array', () => {
      expect(() => s.object({}).parse([])).toThrow('Expected object')
    })
    it('validates nested fields', () => {
      const schema = s.object({ n: s.number() })
      expect(() => schema.parse({ n: 'not a number' })).toThrow('Expected number')
    })
  })

  describe('s.array()', () => {
    it('parses valid array', () => {
      expect(s.array(s.number()).parse([1, 2, 3])).toEqual([1, 2, 3])
    })
    it('rejects non-array', () => {
      expect(() => s.array(s.number()).parse('x')).toThrow('Expected array')
    })
    it('validates items', () => {
      expect(() => s.array(s.number()).parse([1, 'x'])).toThrow('Expected number')
    })
  })

  describe('s.optional()', () => {
    it('passes through value', () => {
      expect(s.optional(s.string()).parse('hi')).toBe('hi')
    })
    it('returns undefined for undefined', () => {
      expect(s.optional(s.string()).parse(undefined)).toBeUndefined()
    })
    it('returns undefined for null', () => {
      expect(s.optional(s.string()).parse(null)).toBeUndefined()
    })
  })
})
