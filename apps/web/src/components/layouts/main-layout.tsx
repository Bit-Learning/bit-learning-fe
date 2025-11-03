import { useLayout } from '@/context/layout-context'
import { Outlet } from '@tanstack/react-router'
import { memo } from 'react'
import Footer from './footer'
import Header from './header'
import ScrollToTop from './scroll-to-top'

interface Props {
    children?: React.ReactNode
}

function MainLayoutInner({ children }: Props) {
    const { layoutConfig } = useLayout()
    const { showHeader = true, showFooter = true } = layoutConfig

    return (
        <>
            <div className="flex min-h-screen flex-col">
                {showHeader && <Header />}
                <main>{children || <Outlet />}</main>
                <ScrollToTop />
                {showFooter && <Footer />}
            </div>
        </>
    )
}

const MainLayout = memo(MainLayoutInner)
export default MainLayout
