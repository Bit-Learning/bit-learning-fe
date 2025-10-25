import { Button } from '@workspace/ui/components/Button'
import { ExternalLink, Eye, Grid3x3, Monitor, Share2 } from 'lucide-react'
import { SlidevMode } from '../types'

interface SlidevModeButtonsProps {
    fileName: string
    onOpenMode: (mode: SlidevMode) => void
    isRunning: boolean
}

export const SlidevModeButtons = ({ onOpenMode, isRunning }: SlidevModeButtonsProps) => {
    const modes: Array<{ mode: SlidevMode; label: string; icon: React.ReactNode; color: string }> = [
        {
            mode: 'show',
            label: 'Present',
            icon: <Monitor className="h-4 w-4" />,
            color: 'bg-blue-500 hover:bg-blue-600',
        },
        {
            mode: 'presenter',
            label: 'Presenter Mode',
            icon: <Eye className="h-4 w-4" />,
            color: 'bg-purple-500 hover:bg-purple-600',
        },
        {
            mode: 'overview',
            label: 'Overview',
            icon: <Grid3x3 className="h-4 w-4" />,
            color: 'bg-green-500 hover:bg-green-600',
        },
        {
            mode: 'export',
            label: 'Export',
            icon: <Share2 className="h-4 w-4" />,
            color: 'bg-orange-500 hover:bg-orange-600',
        },
    ]

    if (!isRunning) {
        return (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                <p className="mb-2 text-sm font-medium text-amber-800">⚠️ Slidev Server Not Running</p>
                <p className="mb-3 text-xs text-amber-700">Please start the Slidev server to view presentations:</p>
                <code className="block rounded bg-amber-100 p-2 text-xs text-amber-900">
                    cd apps/slidev && pnpm dev
                </code>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {modes.map(({ mode, label, icon, color }) => (
                <Button
                    key={mode}
                    onClick={() => onOpenMode(mode)}
                    className={`flex items-center gap-2 text-white ${color}`}
                    size="sm"
                >
                    {icon}
                    <span className="hidden sm:inline">{label}</span>
                    <ExternalLink className="h-3 w-3" />
                </Button>
            ))}
        </div>
    )
}
