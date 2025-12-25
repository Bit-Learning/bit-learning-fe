import { useLayout } from '@/shared/context/layout-context'
import { useRouter } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/Button'

export default function NotFoundError() {
    const router = useRouter()

    return (
        <div className="h-svh">
            <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
                <h1 className="text-[7rem] font-bold leading-tight">404</h1>
                <span className="font-medium">Không tìm thấy trang!</span>
                <p className="text-muted-foreground text-center">
                    Có vẻ như trang bạn đang tìm kiếm <br />
                    không tồn tại hoặc đã bị xóa.
                </p>
                <div className="mt-6 flex gap-4">
                    <Button variant="outline" onClick={() => router.history.back()}>
                        Quay lại
                    </Button>
                    <Button onClick={() => router.navigate({ to: '/' })}>Về trang chủ</Button>
                </div>
            </div>
        </div>
    )
}

/************************* NOT FOUN PAGE Exclude Header Footer ******************************/

import { useEffect } from 'react'

export function NotFoundErrorPage() {
    const { setLayoutConfig } = useLayout()

    useEffect(() => {
        // Set layout config for this page: hide header hide footer
        setLayoutConfig({ showHeader: false, showFooter: false })

        // Reset to default when leaving the page
        return () => {
            setLayoutConfig({ showHeader: true, showFooter: true })
        }
    }, [setLayoutConfig])

    return <NotFoundErrorV2 />
}

function NotFoundErrorV2() {
    const router = useRouter()

    return (
        <div className="h-svh">
            <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
                <h1 className="text-[7rem] font-bold leading-tight">404</h1>
                <span className="font-medium">Không tìm thấy trang!</span>
                <p className="text-muted-foreground text-center">
                    Có vẻ như trang bạn đang tìm kiếm <br />
                    không tồn tại hoặc đã bị xóa.
                </p>
                <div className="mt-6 flex gap-4">
                    <Button variant="outline" onClick={() => router.history.back()}>
                        Quay lại
                    </Button>
                    <Button onClick={() => router.navigate({ to: '/' })}>Về trang chủ</Button>
                </div>
            </div>
        </div>
    )
}
