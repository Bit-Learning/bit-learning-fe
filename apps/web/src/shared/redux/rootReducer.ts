import course from '@/feature/course/store/course.store'
import lecture from '@/feature/lecture/store/lecture.store'
import section from '@/feature/lecture/store/section.store'
import type { AnyAction, Reducer } from '@reduxjs/toolkit'
import { combineReducers } from '@reduxjs/toolkit'
import app from '../../feature/app/store'
import auth from '../../feature/auth/store'

const combineReducer = combineReducers({
    app: app,
    auth: auth,
    course: course,
    section: section,
    lecture: lecture,
})

export type RootState = ReturnType<typeof combineReducer>

const rootReducer: Reducer<RootState, AnyAction> = (state, action) => {
    if (action.type === 'logOut') {
        state = {} as RootState
    }
    return combineReducer(state, action)
}

export default rootReducer
