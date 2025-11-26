import { describe, expect, it } from 'vitest'
import { mergeName } from './string-utils'

describe('String Utils', () => {
    describe('mergeName', () => {
        it('should merge first and last name correctly', () => {
            const result = mergeName('John', 'Doe')
            expect(result).toBe('John Doe')
        })

        it('should handle empty first name', () => {
            const result = mergeName('', 'Doe')
            expect(result).toBe(' Doe')
        })

        it('should handle empty last name', () => {
            const result = mergeName('John', '')
            expect(result).toBe('John ')
        })

        it('should handle both empty names', () => {
            const result = mergeName('', '')
            expect(result).toBe(' ')
        })

        it('should handle undefined names', () => {
            const result = mergeName(undefined as any, undefined as any)
            expect(result).toBe('undefined undefined')
        })
    })
})
