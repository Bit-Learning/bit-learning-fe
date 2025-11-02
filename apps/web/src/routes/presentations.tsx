import Footer from '@/components/layouts/footer'
import Header from '@/components/layouts/header'
import PresentationBanner from '@/shared/components/PresentationBanner'
import ProductGrid from '@/shared/components/ProductGrid'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
}

export const Route = createFileRoute('/presentations')({
    component: PresentationRoute,
})

function PresentationRoute() {
    const navigate = useNavigate()

    return (
        // === PAGE LOAD ANIMATION ===
        <motion.div
            className="flex min-h-screen flex-col"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
        >
            <Header />

            {/* === MAIN CONTENT (SCROLL ANIMATED SECTIONS) === */}
            <main className="flex-1 overflow-hidden bg-[#FFFFFF]">
                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <PresentationBanner />
                </motion.div>

                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <ProductGrid title="Slide Template" badgeText="Chuyên đề giáo dục" viewMoreLink="hehe" />
                </motion.div>
            </main>

            {/* Footer */}
            <Footer />
        </motion.div>
    )
}
