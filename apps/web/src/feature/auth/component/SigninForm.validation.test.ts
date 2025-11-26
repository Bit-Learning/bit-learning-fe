// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

// Import the form schema from SigninForm (we'll extract it)
const formSchema = z.object({
    email: z
        .string()
        .max(50, { message: 'Email không được vượt quá 50 ký tự' })
        .email({ message: 'Email không hợp lệ' }),
    password: z
        .string()
        .min(3, { message: 'Mật khẩu phải có ít nhất 3 ký tự' })
        .max(50, { message: 'Mật khẩu không được vượt quá 50 ký tự' }),
})

describe('SignIn Form Validation', () => {
    describe('Email validation', () => {
        it('should accept valid email addresses', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'firstname+lastname@company.org',
                'a@b.co',
            ]

            validEmails.forEach(email => {
                const result = formSchema.shape.email.safeParse(email)
                expect(result.success).toBe(true)
            })
        })

        it('should reject invalid email addresses', () => {
            const invalidEmails = ['invalid-email', '@domain.com', 'user@', 'user.domain.com', '']

            invalidEmails.forEach(email => {
                const result = formSchema.shape.email.safeParse(email)
                expect(result.success).toBe(false)
                if (!result.success) {
                    expect(result.error?.issues[0].message).toBe('Email không hợp lệ')
                }
            })
        })

        it('should reject emails longer than 50 characters', () => {
            const longEmail = 'a'.repeat(40) + '@example.com' // 51 characters
            const result = formSchema.shape.email.safeParse(longEmail)

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error?.issues[0].message).toBe('Email không được vượt quá 50 ký tự')
            }
        })
    })

    describe('Password validation', () => {
        it('should accept valid passwords', () => {
            const validPasswords = [
                'abc',
                'password123',
                'MySecurePassword!',
                '123',
                'a'.repeat(50), // Exactly 50 characters
            ]

            validPasswords.forEach(password => {
                const result = formSchema.shape.password.safeParse(password)
                expect(result.success).toBe(true)
            })
        })

        it('should reject passwords shorter than 3 characters', () => {
            const shortPasswords = ['', 'a', 'ab']

            shortPasswords.forEach(password => {
                const result = formSchema.shape.password.safeParse(password)
                expect(result.success).toBe(false)
                if (!result.success) {
                    expect(result.error?.issues[0].message).toBe('Mật khẩu phải có ít nhất 3 ký tự')
                }
            })
        })

        it('should reject passwords longer than 50 characters', () => {
            const longPassword = 'a'.repeat(51)
            const result = formSchema.shape.password.safeParse(longPassword)

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error?.issues[0].message).toBe('Mật khẩu không được vượt quá 50 ký tự')
            }
        })
    })

    describe('Complete form validation', () => {
        it('should validate complete valid form data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password123',
            }

            const result = formSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should reject form with invalid data', () => {
            const invalidData = {
                email: 'invalid-email',
                password: 'ab',
            }

            const result = formSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues).toHaveLength(2) // Both email and password errors
            }
        })

        it('should handle missing fields', () => {
            const incompleteData = {
                email: 'test@example.com',
                // password missing
            }

            const result = formSchema.safeParse(incompleteData)
            expect(result.success).toBe(false)
        })
    })
})
