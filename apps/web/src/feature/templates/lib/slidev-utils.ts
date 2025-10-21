import { SlidevConfig, SlidevMode } from '../types'

export const SLIDEV_CONFIG: SlidevConfig = {
    baseUrl: 'http://localhost',
    port: 3030,
}

export const getSlidevUrl = (fileName: string, mode: SlidevMode = 'show'): string => {
    const { baseUrl, port } = SLIDEV_CONFIG
    const base = `${baseUrl}:${port}`

    // Map modes to Slidev routes
    const modeRoutes: Record<SlidevMode, string> = {
        show: '',
        presenter: '/presenter',
        overview: '/overview',
        export: '/export',
    }

    const route = modeRoutes[mode]
    return `${base}${route}`
}

export const checkSlidevRunning = async (): Promise<boolean> => {
    try {
        await fetch(`${SLIDEV_CONFIG.baseUrl}:${SLIDEV_CONFIG.port}`, {
            method: 'HEAD',
            mode: 'no-cors',
        })
        return true
    } catch (_error) {
        return false
    }
}

export const openSlidevPresentation = (fileName: string, mode: SlidevMode = 'show') => {
    const url = getSlidevUrl(fileName, mode)
    window.open(url, '_blank', 'noopener,noreferrer')
}
