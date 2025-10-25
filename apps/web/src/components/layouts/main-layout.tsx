import { Outlet } from '@tanstack/react-router'
import { memo } from 'react'
import Footer from './footer'
import Header from './header'
import ScrollToTop from './scroll-to-top'

interface Props {
    children?: React.ReactNode
}

function MainLayoutInner({ children }: Props) {
    return (
        <>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main>{children || <Outlet />}</main>
                <ScrollToTop />
                <Footer />
            </div>
        </>
    )
}

const MainLayout = memo(MainLayoutInner)
export default MainLayout
