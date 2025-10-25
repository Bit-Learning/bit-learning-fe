import type { RootState } from '@/shared/redux/store'

export const selectAuthStateInfo = (state: RootState) => state.auth
