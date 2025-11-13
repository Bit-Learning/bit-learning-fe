import { useLayout } from '@/context/layout-context'
import { motion } from 'framer-motion'
import { memo } from 'react'
import Footer from './footer'
import Header from './header'
import ScrollToTop from './scroll-to-top'

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
}

interface Props {
    children?: React.ReactNode
    applyMotions?: boolean
}

function MainLayoutInner({ children, applyMotions = true }: Props) {
    const { layoutConfig } = useLayout()
    const { showHeader = true, showFooter = true } = layoutConfig

    return (
        <>
            {applyMotions === true ? (
                <motion.div
                    className="flex min-h-screen flex-col"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    {showHeader && <Header />}
                    {/* === MAIN CONTENT (SCROLL ANIMATED SECTIONS) === */}
                    <main className="flex-1 bg-[#FFFFFF]">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            {children}
                        </motion.div>
                    </main>
                    <ScrollToTop />
                    {showFooter && <Footer />}
                </motion.div>
            ) : (
                <div className="flex min-h-screen flex-col">
                    {showHeader && <Header />}
                    <main className="flex-1 bg-[#FFFFFF]">{children}</main>
                    <ScrollToTop />
                    {showFooter && <Footer />}
                </div>
            )}
        </>
    )
}

const MainLayout = memo(MainLayoutInner)
export default MainLayout
