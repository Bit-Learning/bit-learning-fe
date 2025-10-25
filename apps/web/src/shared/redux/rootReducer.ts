import app from '../../app/store'
import auth from '../../feature/auth/store'
import { combineReducers } from '@reduxjs/toolkit'
import type { AnyAction, Reducer } from '@reduxjs/toolkit'

const combineReducer = combineReducers({
    app: app,
    auth: auth,
})

export type RootState = ReturnType<typeof combineReducer>

const rootReducer: Reducer<RootState, AnyAction> = (state, action) => {
    if (action.type === 'logOut') {
        state = {} as RootState
    }
    return combineReducer(state, action)
}

export default rootReducer
