import { AxiosInstance } from 'axios'
import { AuthApi } from './sdk/auth.api'
import { ExampleApi } from './sdk/example.api'

/**
 * API class for the application
 * @example
 * const api = new Api(
 * axios.create({
        baseURL: 'http://localhost:8080',
    }),
 * )
 * api.example.hello()
 */
export class Api {
    example: ExampleApi
    auth: AuthApi

    constructor(private readonly client: AxiosInstance) {
        this.example = new ExampleApi(this.client)
        this.auth = new AuthApi(this.client)
    }
}
