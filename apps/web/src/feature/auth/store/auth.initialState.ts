import type { TAuthState } from '../type/authState'

export const authInitialState: TAuthState = {
    isAuthenticated: false,
    isLoading: false,
    errorMsg: null,
    userInfo: null,
}
