import apiInstance from '@/shared/api/api'
import { Api } from '@workspace/lib/api'

// Create API client instance with interceptors
export const apiClient = new Api(apiInstance)
