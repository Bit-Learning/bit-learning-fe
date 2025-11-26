// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { configureStore } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import appReducer from '../../app/store'
import authReducer from '../store'
import SignInForm from './SigninForm'

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
    Link: ({ children, to, className }: any) => (
        <a href={to} className={className}>
            {children}
        </a>
    ),
    useNavigate: () => vi.fn(),
}))

// Mock the toast function
vi.mock('@workspace/ui/components/Sonner', () => ({
    toast: {
        warning: vi.fn(),
        error: vi.fn(),
    },
}))

// Mock the OAuth2 hook
vi.mock('../hook/useOAuth2', () => ({
    useGoogleOAuth2Config: () => ({
        data: {
            authorizationUrl: 'https://accounts.google.com/oauth/authorize?test=true',
        },
        isError: false,
        error: null,
    }),
}))

// Mock window.location
Object.defineProperty(window, 'location', {
    value: {
        href: '',
    },
    writable: true,
})

// Helper function to create a test store
const createTestStore = (initialState = {}) => {
    return configureStore({
        reducer: {
            auth: authReducer,
            app: appReducer,
        },
        preloadedState: {
            auth: {
                isLoading: false,
                isAuthenticated: false,
                userInfo: null,
                errorMsg: null,
                ...initialState.auth,
            },
            app: {
                isLoading: false,
                theme: 'light',
                language: 'vi',
                sidebarOpen: false,
                ...initialState.app,
            },
        },
    })
}

// Wrapper component for tests
const TestWrapper = ({ children, store }: { children: React.ReactNode; store: any }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                staleTime: 0,
            },
        },
    })

    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </Provider>
    )
}

describe('SignInForm', () => {
    let store: any
    const user = userEvent.setup()

    beforeEach(() => {
        store = createTestStore()
        vi.clearAllMocks()
    })

    describe('Rendering', () => {
        it('should render all form elements', () => {
            render(
                <TestWrapper store={store}>
                    <SignInForm />
                </TestWrapper>,
            )

            expect(screen.getByText('Chào mừng trở lại!')).toBeInTheDocument()
            expect(screen.getByText('Đăng nhập để truy cập tài khoản của bạn')).toBeInTheDocument()
            expect(screen.getByPlaceholderText('Nhập email của bạn')).toBeInTheDocument()
            expect(screen.getByPlaceholderText('Nhập mật khẩu của bạn')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /đăng nhập với google/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /đăng nhập$/i })).toBeInTheDocument()
            expect(screen.getByText('Ghi nhớ đăng nhập')).toBeInTheDocument()
            expect(screen.getByText('Quên mật khẩu?')).toBeInTheDocument()
            expect(screen.getByText('Đăng ký ngay')).toBeInTheDocument()
        })

        it('should render logo images', () => {
            render(
                <TestWrapper store={store}>
                    <SignInForm />
                </TestWrapper>,
            )

            const logoImages = screen.getAllByAltText('Bithub Logo')
            expect(logoImages).toHaveLength(2) // One for mobile, one for form
        })
    })

    describe('Form Validation', () => {
        it('should show email validation error for invalid email', async () => {
            render(
                <TestWrapper store={store}>
                    <SignInForm />
                </TestWrapper>,
            )

            const emailInput = screen.getByPlaceholderText('Nhập email của bạn')
            const submitButton = screen.getByRole('button', { name: /đăng nhập$/i })

            await user.type(emailInput, 'invalid-email')
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText('Email không hợp lệ')).toBeInTheDocument()
            })
        })

        it('should show email length validation error', async () => {
            render(
                <TestWrapper store={store}>
                    <SignInForm />
                </TestWrapper>,
            )

            const emailInput = screen.getByPlaceholderText('Nhập email của bạn')
            const submitButton = screen.getByRole('button', { name: /đăng nhập$/i })

            // Create an email longer than 50 characters
            const longEmail = 'a'.repeat(40) + '@example.com'
            await user.type(emailInput, longEmail)
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText('Email không được vượt quá 50 ký tự')).toBeInTheDocument()
            })
        })

        it('should show password validation error for short password', async () => {
            render(
                <TestWrapper store={store}>
                    <SignInForm />
                </TestWrapper>,
            )

            const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu của bạn')
            const submitButton = screen.getByRole('button', { name: /đăng nhập$/i })

            await user.type(passwordInput, 'ab') // Less than 3 characters
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText('Mật khẩu phải có ít nhất 3 ký tự')).toBeInTheDocument()
            })
        })

        it('should show password length validation error', async () => {
            render(
                <TestWrapper store={store}>
                    <SignInForm />
                </TestWrapper>,
            )

            const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu của bạn')
            const submitButton = screen.getByRole('button', { name: /đăng nhập$/i })

            const longPassword = 'a'.repeat(51) // More than 50 characters
            await user.type(passwordInput, longPassword)
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText('Mật khẩu không được vượt quá 50 ký tự')).toBeInTheDocument()
            })
        })
    })

    describe('User Interactions', () => {
        it('should toggle password visibility', async () => {
            render(
                <TestWrapper store={store}>
                    <SignInForm />
                </TestWrapper>,
            )

            const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu của bạn')
            const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button

            expect(passwordInput).toHaveAttribute('type', 'password')

            await user.click(toggleButton)
            expect(passwordInput).toHaveAttribute('type', 'text')

            await user.click(toggleButton)
            expect(passwordInput).toHaveAttribute('type', 'password')
        })

        it('should allow typing in email and password fields', async () => {
            render(
                <TestWrapper store={store}>
                    <SignInForm />
                </TestWrapper>,
            )

            const emailInput = screen.getByPlaceholderText('Nhập email của bạn')
            const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu của bạn')

            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'password123')

            expect(emailInput).toHaveValue('test@example.com')
            expect(passwordInput).toHaveValue('password123')
        })

        it('should handle Google OAuth button click', async () => {
            render(
                <TestWrapper store={store}>
                    <SignInForm />
                </TestWrapper>,
            )

            const googleButton = screen.getByRole('button', { name: /đăng nhập với google/i })

            await user.click(googleButton)

            expect(window.location.href).toBe('https://accounts.google.com/oauth/authorize?test=true')
        })
    })

    describe('Loading State', () => {
        it('should show loading overlay when isLoading is true', () => {
            const loadingStore = createTestStore({
                auth: { isLoading: true },
            })

            render(
                <TestWrapper store={loadingStore}>
                    <SignInForm />
                </TestWrapper>,
            )

            const loadingTexts = screen.getAllByText('Đang đăng nhập...')
            expect(loadingTexts).toHaveLength(2) // One in overlay, one in button
            expect(screen.getByRole('button', { name: 'Đang đăng nhập...' })).toBeDisabled()
        })

        it('should show loading text on submit button when loading', () => {
            const loadingStore = createTestStore({
                auth: { isLoading: true },
            })

            render(
                <TestWrapper store={loadingStore}>
                    <SignInForm />
                </TestWrapper>,
            )

            const submitButton = screen.getByRole('button', { name: 'Đang đăng nhập...' })
            expect(submitButton).toHaveTextContent('Đang đăng nhập...')
            expect(submitButton).toBeDisabled()
        })
    })

    describe('Error State', () => {
        it('should display error message when errorMsg is present', () => {
            const errorStore = createTestStore({
                auth: { errorMsg: 'Email hoặc mật khẩu không đúng' },
            })

            render(
                <TestWrapper store={errorStore}>
                    <SignInForm />
                </TestWrapper>,
            )

            expect(screen.getByText('Email hoặc mật khẩu không đúng')).toBeInTheDocument()
        })

        it('should not display error message when errorMsg is null', () => {
            render(
                <TestWrapper store={store}>
                    <SignInForm />
                </TestWrapper>,
            )

            expect(screen.queryByText('Email hoặc mật khẩu không đúng')).not.toBeInTheDocument()
        })
    })

    describe('Form Submission', () => {
        it('should call onSubmit with valid form data', async () => {
            const mockDispatch = vi.fn()
            store.dispatch = mockDispatch

            render(
                <TestWrapper store={store}>
                    <SignInForm />
                </TestWrapper>,
            )

            const emailInput = screen.getByPlaceholderText('Nhập email của bạn')
            const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu của bạn')
            const submitButton = screen.getByRole('button', { name: /đăng nhập$/i })

            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'password123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalled()
            })
        })

        it('should not submit form with invalid data', async () => {
            const mockDispatch = vi.fn()
            store.dispatch = mockDispatch

            render(
                <TestWrapper store={store}>
                    <SignInForm />
                </TestWrapper>,
            )

            const submitButton = screen.getByRole('button', { name: /đăng nhập$/i })
            await user.click(submitButton)

            // Should show validation errors but not call dispatch
            await waitFor(() => {
                expect(screen.getByText('Email không hợp lệ')).toBeInTheDocument()
            })

            expect(mockDispatch).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    type: expect.stringContaining('requestLogin'),
                }),
            )
        })
    })

    describe('Navigation Links', () => {
        it('should render navigation links with correct text', () => {
            render(
                <TestWrapper store={store}>
                    <SignInForm />
                </TestWrapper>,
            )

            expect(screen.getByText('Trang chủ')).toBeInTheDocument()
            expect(screen.getByText('Quên mật khẩu?')).toBeInTheDocument()
            expect(screen.getByText('Đăng ký ngay')).toBeInTheDocument()
        })
    })

    describe('Accessibility', () => {
        it('should have proper labels and roles', () => {
            render(
                <TestWrapper store={store}>
                    <SignInForm />
                </TestWrapper>,
            )

            expect(screen.getByPlaceholderText('Nhập email của bạn')).toBeInTheDocument()
            expect(screen.getByPlaceholderText('Nhập mật khẩu của bạn')).toBeInTheDocument()
            expect(screen.getByRole('checkbox')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /đăng nhập với google/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /đăng nhập$/i })).toBeInTheDocument()
        })

        it('should have required field indicators', () => {
            render(
                <TestWrapper store={store}>
                    <SignInForm />
                </TestWrapper>,
            )

            const requiredIndicators = screen.getAllByText('*')
            expect(requiredIndicators).toHaveLength(2) // Email and password fields
        })
    })
})
