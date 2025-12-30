import GameWPMTestingPage from '@/feature/game/page/GameWPMTestingPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/test-wpm')({
    component: RouteComponent,
})

function RouteComponent() {
    return <GameWPMTestingPage />
}
