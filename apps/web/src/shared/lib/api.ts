import { Api } from '@workspace/lib/api'
import axios from 'axios'

export type * from '@workspace/lib/api'

export const api = new Api(
    axios.create({
        baseURL: 'http://localhost:4006', // Updated to match the auth server
    }),
)
