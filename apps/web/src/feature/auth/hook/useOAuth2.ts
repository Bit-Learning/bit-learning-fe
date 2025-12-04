import { useQuery } from '@tanstack/react-query'
import { GetGoogleOAuth2Config } from '../api/auth.api'

export const OAUTH2_QUERY_KEYS = {
    googleConfig: ['oauth2', 'google', 'config'] as const,
}

interface GoogleOAuth2ConfigResponse {
    authUrl: string
    clientId: string
    redirectUri: string
    responseType: string
    scope: string
    accessType: string
    prompt: string
}

interface GoogleOAuth2Config {
    clientId: string
    redirectUri: string
    authorizationUrl: string
}

/**
 * Build the complete Google OAuth2 authorization URL from config parameters
 */
const buildAuthorizationUrl = (config: GoogleOAuth2ConfigResponse): string => {
    const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: config.responseType,
        scope: config.scope,
        access_type: config.accessType,
        prompt: config.prompt,
    })
    return `${config.authUrl}?${params.toString()}`
}

/**
 * Hook to fetch Google OAuth2 configuration
 * This hook fetches the OAuth2 config only once and caches it
 * No automatic retries to avoid unnecessary API calls
 */
export const useGoogleOAuth2Config = () => {
    return useQuery<GoogleOAuth2Config>({
        queryKey: OAUTH2_QUERY_KEYS.googleConfig,
        queryFn: async () => {
            try {
                const response = await GetGoogleOAuth2Config()
                const configData: GoogleOAuth2ConfigResponse = response.data.data

                // Build the authorization URL from the config parameters
                return {
                    clientId: configData.clientId,
                    redirectUri: configData.redirectUri,
                    authorizationUrl: buildAuthorizationUrl(configData),
                }
            } catch (error) {
                console.error('[OAuth2] Failed to fetch Google OAuth2 config:', error)
                // Return null instead of throwing to prevent infinite refresh
                throw error
            }
        },
        staleTime: Infinity, // Config rarely changes, keep it fresh forever
        gcTime: Infinity, // Keep the cache forever (renamed from cacheTime in v5)
        retry: false, // Don't retry failed requests to avoid spamming the server
        retryOnMount: false, // Don't retry when component remounts
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component remount
        refetchOnReconnect: false, // Don't refetch when internet reconnects
    })
}
