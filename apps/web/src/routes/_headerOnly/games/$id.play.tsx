import { GamePlayPage } from '@/feature/game/page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_headerOnly/games/$id/play')({
    component: function GamePlayRoute() {
        const { id } = Route.useParams()
        return <GamePlayPage id={id} />
    },
})
