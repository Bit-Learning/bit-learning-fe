import { NotFoundErrorPage } from '@/feature/app/page/NotFound'
import { GameDetailPage } from '@/feature/game/page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/games/$id/')({
    component: function GameDetailRoute() {
        const { id } = Route.useParams()
        return <GameDetailPage id={id} />
    },
    errorComponent: () => <NotFoundErrorPage />,
})
