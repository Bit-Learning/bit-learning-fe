import MemberGrid from '@/shared/components/MemberGrid'
import ProductCarousel from '@/shared/components/ProductCarousel'
import ProductGrid from '@/shared/components/ProductGrid'
import SlideBanner from '@/shared/components/SlideBanner'
import SyllabusGrid from '@/shared/components/SyllabusGrid'
import { Footer } from '@/shared/layouts/Footer'
import { FullHeader } from '@/shared/layouts/Header'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'

// Define animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
}

function InnEduHomePage() {
    const navigate = useNavigate()

    return (
        // === PAGE LOAD ANIMATION ===
        <motion.div
            className="flex min-h-screen flex-col"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
        >
            {/* Top background layer */}
            <FullHeader />

            {/* === MAIN CONTENT (SCROLL ANIMATED SECTIONS) === */}
            <main className="flex-1 overflow-hidden bg-[#FFFFFF]">
                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <SlideBanner />
                </motion.div>

                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ duration: 0.6, delay: 0.1 }}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <SyllabusGrid title="Giáo Án" badgeText="STEAM" />
                </motion.div>

                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ duration: 0.6, delay: 0.15 }}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <MemberGrid title="NHỮNG CHUYÊN GIA INNEDU" badgeText="Giới thiệu" viewMoreLink="hehe" />
                </motion.div>

                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <ProductGrid title="STEAM, AI, Tâm Lý Học" badgeText="Chuyên đề giáo dục" viewMoreLink="hehe" />
                </motion.div>

                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ duration: 0.6, delay: 0.25 }}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <ProductCarousel />
                </motion.div>
            </main>

            {/* Footer */}
            <Footer />
        </motion.div>
    )
}
