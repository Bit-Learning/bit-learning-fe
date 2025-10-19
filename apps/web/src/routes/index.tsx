import MemberGrid from '@/shared/components/MemberGrid'
import ProductCarousel from '@/shared/components/ProductCarousel'
import ProductGrid from '@/shared/components/ProductGrid'
import SlideBanner from '@/shared/components/SlideBanner'
import SyllabusGrid from '@/shared/components/SyllabusGrid'
import { Footer } from '@/shared/layouts/Footer'
import { Header } from '@/shared/layouts/Header'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    component: InnEduHomePage,
})

function InnEduHomePage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Top background layer */}
            <div className="relative">
                {/* Purple/Navy curved background */}
                <div className="absolute inset-0 h-28 bg-[#14244A] rounded-b-3xl" />

                {/* Header sits above */}
                <div className="relative mt-10 z-10">
                    <Header />
                </div>
            </div>

            {/* Main content */}
            <main className="flex-1 bg-[#FFFFFF]">
                <SlideBanner />
                <SyllabusGrid title="Giáo Án" badgeText="STEAM" />
                <MemberGrid title="NHỮNG CHUYÊN GIA INNEDU" badgeText="Giới thiệu" viewMoreLink="hehe" />
                <ProductGrid title="STEAM, AI, Tâm Lý Học" badgeText="Chuyên đề giáo dục" viewMoreLink="hehe" />

                <ProductCarousel />
            </main>

            <Footer />
        </div>
    )
}
