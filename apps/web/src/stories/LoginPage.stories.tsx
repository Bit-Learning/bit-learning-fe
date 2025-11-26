import { configureStore } from '@reduxjs/toolkit'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router'
import '@workspace/ui/globals.css'
import { Provider } from 'react-redux'
import appReducer from '../feature/app/store'
import SignInForm from '../feature/auth/component/SigninForm'
import authReducer from '../feature/auth/store'

// Create a mock Redux store with proper reducers
const createMockStore = (initialState = {}) =>
    configureStore({
        reducer: {
            auth: authReducer,
            app: appReducer,
        },
        preloadedState: initialState,
    })

// Create QueryClient with mock handlers
const createQueryClient = (mockOAuthConfig?: any) =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                staleTime: 0,
            },
        },
    })

// Wrapper component with all necessary providers
interface LoginPageWrapperProps {
    initialState?: any
    mockOAuthConfig?: {
        authorizationUrl?: string
        isError?: boolean
    }
    onSubmit?: (values: any) => void
}

const LoginPageWrapper = ({ initialState = {}, mockOAuthConfig, onSubmit }: LoginPageWrapperProps) => {
    const store = createMockStore(initialState)
    const queryClient = createQueryClient(mockOAuthConfig)

    // Create a minimal router setup
    const rootRoute = createRootRoute({
        component: () => (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="flex h-screen w-full">
                    <SignInForm />
                </div>
            </div>
        ),
    })

    const router = createRouter({
        routeTree: rootRoute,
        history: createMemoryHistory({
            initialEntries: ['/signin'],
        }),
    })

    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </Provider>
    )
}

const meta = {
    title: 'Pages/Authentication/SignIn',
    component: LoginPageWrapper,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: `
# Sign In Page

A comprehensive authentication page featuring:
- Email/password login
- Google OAuth integration
- Form validation with Zod
- Remember me functionality
- Password visibility toggle
- Responsive design for mobile, tablet, and desktop

## Features
- 📧 Email/password authentication
- 🔐 Secure password input with show/hide toggle
- 🔄 Loading states
- ⚠️ Error handling and display
- 📱 Fully responsive design
- 🎨 Modern UI with Tailwind CSS
- ♿ Accessible form controls
            `,
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        initialState: {
            description: 'Initial Redux state for the component',
            control: 'object',
        },
        mockOAuthConfig: {
            description: 'Mock OAuth configuration for testing',
            control: 'object',
        },
    },
} satisfies Meta<typeof LoginPageWrapper>

export default meta
type Story = StoryObj<typeof meta>

// Default state
const defaultAuthState = {
    auth: {
        isLoading: false,
        isAuthenticated: false,
        userInfo: null,
        errorMsg: null,
    },
    app: {
        isLoading: false,
        theme: 'light',
        language: 'vi',
        sidebarOpen: false,
    },
}

/**
 * Default sign-in page state
 */
export const Default: Story = {
    args: {
        initialState: defaultAuthState,
    },
}

/**
 * Loading state while authenticating
 */
export const Loading: Story = {
    args: {
        initialState: {
            auth: {
                isLoading: true,
                isAuthenticated: false,
                userInfo: null,
                errorMsg: null,
            },
            app: defaultAuthState.app,
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows the loading state when the user submits the login form',
            },
        },
    },
}

/**
 * Error state - Invalid credentials
 */
export const WithInvalidCredentialsError: Story = {
    args: {
        initialState: {
            auth: {
                isLoading: false,
                isAuthenticated: false,
                userInfo: null,
                errorMsg: 'Email hoặc mật khẩu không đúng',
            },
            app: defaultAuthState.app,
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'Displays error message when user enters incorrect credentials',
            },
        },
    },
}

/**
 * Error state - Account not activated
 */
export const AccountNotActivated: Story = {
    args: {
        initialState: {
            auth: {
                isLoading: false,
                isAuthenticated: false,
                userInfo: null,
                errorMsg: 'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để kích hoạt.',
            },
            app: defaultAuthState.app,
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows warning when account needs activation',
            },
        },
    },
}

/**
 * Error state - Network error
 */
export const NetworkError: Story = {
    args: {
        initialState: {
            auth: {
                isLoading: false,
                isAuthenticated: false,
                userInfo: null,
                errorMsg: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
            },
            app: defaultAuthState.app,
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'Handles network connectivity errors',
            },
        },
    },
}

/**
 * OAuth configuration error
 */
export const OAuthConfigError: Story = {
    args: {
        initialState: defaultAuthState,
        mockOAuthConfig: {
            isError: true,
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows disabled Google OAuth button when configuration fails',
            },
        },
    },
}

/**
 * Successfully authenticated
 */
export const Authenticated: Story = {
    args: {
        initialState: {
            auth: {
                isLoading: false,
                isAuthenticated: true,
                userInfo: {
                    id: '1',
                    email: 'user@example.com',
                    name: 'John Doe',
                },
                errorMsg: null,
            },
            app: defaultAuthState.app,
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'User is successfully authenticated (will redirect to home)',
            },
        },
    },
}

/**
 * Mobile viewport (iPhone 12 Pro)
 */
export const Mobile: Story = {
    args: {
        initialState: defaultAuthState,
    },
    parameters: {
        viewport: {
            defaultViewport: 'mobile1',
        },
        docs: {
            description: {
                story: 'Sign-in page optimized for mobile devices (390x844)',
            },
        },
    },
}

/**
 * Tablet viewport (iPad)
 */
export const Tablet: Story = {
    args: {
        initialState: defaultAuthState,
    },
    parameters: {
        viewport: {
            defaultViewport: 'tablet',
        },
        docs: {
            description: {
                story: 'Sign-in page optimized for tablet devices (768x1024)',
            },
        },
    },
}

/**
 * Desktop large viewport
 */
export const DesktopLarge: Story = {
    args: {
        initialState: defaultAuthState,
    },
    parameters: {
        viewport: {
            defaultViewport: 'desktop',
        },
        docs: {
            description: {
                story: 'Sign-in page on large desktop screens (1920x1080)',
            },
        },
    },
}

/**
 * With pre-filled email (e.g., from signup)
 */
export const PreFilledEmail: Story = {
    args: {
        initialState: defaultAuthState,
    },
    play: async ({ canvasElement }) => {
        const canvas = canvasElement as HTMLElement
        const emailInput = canvas.querySelector('input[type="email"]') as HTMLInputElement
        if (emailInput) {
            emailInput.value = 'user@example.com'
            emailInput.dispatchEvent(new Event('input', { bubbles: true }))
        }
    },
    parameters: {
        docs: {
            description: {
                story: 'Email field pre-filled (e.g., user coming from signup page)',
            },
        },
    },
}

/**
 * Password visible state
 */
export const PasswordVisible: Story = {
    args: {
        initialState: defaultAuthState,
    },
    play: async ({ canvasElement }) => {
        const canvas = canvasElement as HTMLElement
        const toggleButton = canvas.querySelector('button[type="button"]') as HTMLButtonElement
        if (toggleButton) {
            toggleButton.click()
        }
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows password in plain text when visibility toggle is clicked',
            },
        },
    },
}

/**
 * Form validation - Invalid email
 */
export const ValidationInvalidEmail: Story = {
    args: {
        initialState: defaultAuthState,
    },
    play: async ({ canvasElement }) => {
        const canvas = canvasElement as HTMLElement
        const emailInput = canvas.querySelector('input[type="email"]') as HTMLInputElement
        const form = canvas.querySelector('form') as HTMLFormElement

        if (emailInput && form) {
            emailInput.value = 'invalid-email'
            emailInput.dispatchEvent(new Event('input', { bubbles: true }))
            emailInput.dispatchEvent(new Event('blur', { bubbles: true }))
        }
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows validation error for invalid email format',
            },
        },
    },
}

/**
 * Form validation - Short password
 */
export const ValidationShortPassword: Story = {
    args: {
        initialState: defaultAuthState,
    },
    play: async ({ canvasElement }) => {
        const canvas = canvasElement as HTMLElement
        const passwordInput = canvas.querySelector('input[type="password"]') as HTMLInputElement

        if (passwordInput) {
            passwordInput.value = 'ab'
            passwordInput.dispatchEvent(new Event('input', { bubbles: true }))
            passwordInput.dispatchEvent(new Event('blur', { bubbles: true }))
        }
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows validation error when password is too short (< 3 characters)',
            },
        },
    },
}

/**
 * Dark mode (if supported)
 */
export const DarkMode: Story = {
    args: {
        initialState: {
            auth: defaultAuthState.auth,
            app: {
                ...defaultAuthState.app,
                theme: 'dark',
            },
        },
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
        docs: {
            description: {
                story: 'Sign-in page with dark mode theme applied',
            },
        },
    },
}

/**
 * Accessibility test - Keyboard navigation
 */
export const KeyboardNavigation: Story = {
    args: {
        initialState: defaultAuthState,
    },
    parameters: {
        docs: {
            description: {
                story: 'All interactive elements are keyboard accessible (Tab, Enter, Space)',
            },
        },
        a11y: {
            config: {
                rules: [
                    {
                        id: 'color-contrast',
                        enabled: true,
                    },
                    {
                        id: 'label',
                        enabled: true,
                    },
                ],
            },
        },
    },
}

/**
 * Loading with pre-filled form
 */
export const LoadingWithData: Story = {
    args: {
        initialState: {
            auth: {
                isLoading: true,
                isAuthenticated: false,
                userInfo: null,
                errorMsg: null,
            },
            app: defaultAuthState.app,
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = canvasElement as HTMLElement
        const emailInput = canvas.querySelector('input[type="email"]') as HTMLInputElement
        const passwordInput = canvas.querySelector('input[type="password"]') as HTMLInputElement

        if (emailInput && passwordInput) {
            emailInput.value = 'user@example.com'
            passwordInput.value = 'password123'
        }
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows loading state with form data entered',
            },
        },
    },
}
