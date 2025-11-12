import { useLayout } from '@/context/layout-context'
import { selectAuthStateInfo } from '@/feature/auth/store/auth.selectors'
import Mindmap from '@/feature/mindmap/pages/MindMap'
import { getMindMapDataByUserIdAndCode } from '@/feature/mindmap/services/mindmap.service'
import store from '@/shared/redux/store'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/mindmaps/$userId/$code')({
    beforeLoad: async ({ params }) => {
        const state = store.getState()
        const { userInfo } = selectAuthStateInfo(state)

        if (!userInfo || userInfo.id.toString() !== params.userId) {
            throw redirect({ to: '/404' })
        }
    },

    loader: async ({ params }) => {
        const res = await getMindMapDataByUserIdAndCode(+params.userId, params.code)
        return res.data.data
    },

    component: RouteComponent,
})

function RouteComponent() {
    const data = Route.useLoaderData()
    const { setLayoutConfig } = useLayout()

    useEffect(() => {
        setLayoutConfig({ showHeader: false, showFooter: false })

        return () => {
            setLayoutConfig({ showHeader: true, showFooter: true })
        }
    }, [setLayoutConfig])

    return (
        <>
            <Mindmap data={data} />
        </>
    )
}
