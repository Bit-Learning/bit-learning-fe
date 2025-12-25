import { GeneralError } from '@/feature/errors/general-error'
import { GameDashboardPage } from '@/feature/game/page'
import { createFileRoute } from '@tanstack/react-router'

type GameSearchParams = {
    type?: string
}

export const Route = createFileRoute('/games/')({
    component: GameDashboardPage,
    errorComponent: () => <GeneralError />,
    validateSearch: (search: Record<string, unknown>): GameSearchParams => {
        return {
            type: (search.type as string) || undefined,
        }
    },
})
