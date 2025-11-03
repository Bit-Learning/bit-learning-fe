import { createContext, ReactNode, useContext, useState } from 'react'

interface LayoutConfig {
    showHeader?: boolean
    showFooter?: boolean
}

interface LayoutContextType {
    layoutConfig: LayoutConfig
    setLayoutConfig: (config: LayoutConfig) => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export function LayoutProvider({ children }: { children: ReactNode }) {
    const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
        showHeader: true,
        showFooter: true,
    })

    return <LayoutContext.Provider value={{ layoutConfig, setLayoutConfig }}>{children}</LayoutContext.Provider>
}

export function useLayout() {
    const context = useContext(LayoutContext)
    if (context === undefined) {
        throw new Error('useLayout must be used within a LayoutProvider')
    }
    return context
}
