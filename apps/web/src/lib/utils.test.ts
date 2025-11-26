import { describe, expect, it } from 'vitest'

describe('Basic tests', () => {
    it('should pass a simple test', () => {
        expect(1 + 1).toBe(2)
    })

    it('should check string operations', () => {
        const str = 'hello'
        expect(str.toUpperCase()).toBe('HELLO')
    })

    it('should check array operations', () => {
        const arr = [1, 2, 3]
        expect(arr.length).toBe(3)
        expect(arr).toContain(2)
    })

    it('should check object properties', () => {
        const obj = { name: 'test', value: 42 }
        expect(obj).toHaveProperty('name')
        expect(obj.value).toBe(42)
    })
})
