# Admin Authentication Implementation

This document explains the admin-specific authentication implementation that differs from the web app.

## Key Differences from Web App

### 1. **Role Restriction**
- **Web App**: Uses `Roles.USER` for regular users
- **Admin App**: Uses `Roles.ADMIN` for administrators only
- **Enforcement**: Login API call is hardcoded to only accept ADMIN role

### 2. **State Management**
- **Web App**: Uses Redux Toolkit for state management
- **Admin App**: Uses **TanStack Query** (React Query) only - no Redux
  - Simpler state management
  - Built-in caching and request deduplication
  - Automatic refetching and background updates

### 3. **Auth Store**
- Located at: `src/stores/auth-store.ts`
- Uses Zustand (lightweight state management)
- Stores:
  - `accessToken`: JWT access token
  - `refreshToken`: JWT refresh token
  - `user`: Admin user information including firstName, lastName, avatar

### 4. **API Service**
- Located at: `src/features/auth/api/AuthService.ts`
- Key functions:
  - `AdminLogin()`: Enforces ADMIN role
  - `GetAdminProfile()`: Fetches admin user profile
  - `RefreshToken()`: Refreshes expired tokens
  - `Logout()`: Signs out admin user

### 5. **Type Safety**
- Located at: `src/features/auth/types/auth.types.ts`
- Types:
  - `TAdminLoginRequest`: Login payload with ADMIN role
  - `TAdminUser`: Admin-specific user profile
  - `TAdminLoginResponse`: Login response with tokens

## Authentication Flow

### Login Process
1. User enters email and password in sign-in form
2. Form validation with Zod schema
3. TanStack Query mutation calls `AdminLogin()` with:
   ```typescript
   {
     email: string,
     password: string,
     role: 'ADMIN' // Always ADMIN
   }
   ```
4. Backend validates credentials and role
5. On success:
   - Store `accessToken` and `refreshToken` in cookies
   - Store user info in Zustand auth store
   - Redirect to dashboard
6. On error:
   - Display appropriate error toast
   - Handle "not activated" and "invalid credentials" cases
   - Block non-admin users with clear message

### Profile Loading
- Component: `components/profile-dropdown.tsx`
- Uses TanStack Query to fetch profile:
  ```typescript
  useQuery({
    queryKey: ['adminProfile'],
    queryFn: () => GetAdminProfile(),
    enabled: !!auth.accessToken,
  })
  ```
- Displays user avatar, name, and email

### Token Refresh
- Automatic via API interceptor in `shared/api/api.ts`
- On 401 error:
  1. Check if refresh token exists
  2. Call refresh token endpoint
  3. Update stored tokens
  4. Retry original request
  5. If refresh fails, redirect to sign-in

## Security Features

1. **Role Enforcement**: Only ADMIN role can access admin panel
2. **Token Storage**: Secure cookies with SameSite=Strict
3. **Auto Logout**: Clears tokens on refresh failure
4. **HTTPS Only**: Tokens marked as secure in production

## File Structure

```
src/
├── features/
│   └── auth/
│       ├── api/
│       │   └── AuthService.ts       # API calls
│       ├── types/
│       │   └── auth.types.ts        # TypeScript types
│       └── sign-in/
│           ├── index.tsx
│           └── components/
│               └── user-auth-form.tsx  # Login form with TanStack Query
├── stores/
│   └── auth-store.ts                # Zustand auth store
├── shared/
│   ├── api/
│   │   └── api.ts                   # Axios with interceptors
│   └── constants/
│       ├── endpoints.ts
│       ├── keys.ts                  # Cookie keys
│       └── enums.ts                 # Roles enum
└── components/
    ├── profile-dropdown.tsx         # User profile dropdown
    └── sign-out-dialog.tsx          # Sign out confirmation
```

## Usage Examples

### Login Form (with TanStack Query)
```typescript
const loginMutation = useMutation({
  mutationFn: (data: TAdminLoginRequest) => AdminLogin(data),
  onSuccess: (response) => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  },
})

function onSubmit(data) {
  loginMutation.mutate({
    email: data.email,
    password: data.password,
    role: 'ADMIN',
  })
}
```

### Fetch User Profile
```typescript
const { data: profileData } = useQuery({
  queryKey: ['adminProfile'],
  queryFn: () => GetAdminProfile(),
  enabled: !!auth.accessToken,
})
```

### Sign Out
```typescript
const handleSignOut = () => {
  auth.reset() // Clears tokens and user info
  navigate({ to: '/sign-in' })
}
```

## Testing

To test admin login:
1. Start the backend with admin account seeded
2. Use admin credentials:
   - Email: `admin@gmail.com`
   - Password: (your admin password)
3. Non-admin accounts will be rejected with error message

## Notes

- No Redux dependency - keeps bundle size smaller
- TanStack Query provides better DX for API calls
- Zustand for minimal local state (just auth tokens/user)
- All admin-specific logic isolated in `features/auth/`
