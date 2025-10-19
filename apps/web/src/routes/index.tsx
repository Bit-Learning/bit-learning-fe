import ProductGrid from '@/shared/components/ProductGrid'
import SlideBanner from '@/shared/components/SlideBanner'
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
            <main className="flex-1 bg-[#F5FAFF]">
                <SlideBanner />
                <ProductGrid />
            </main>

            <Footer />
        </div>
    )
}
