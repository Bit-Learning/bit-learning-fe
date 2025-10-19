import { Button } from '@workspace/ui/components/Button'

export default function SlideBanner() {
    return (
        <section className="relative w-full h-[400px] bg-gradient-to-r from-blue-600 to-indigo-500 flex items-center justify-center text-center text-white">
            <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">Discover Our Latest Collection</h1>
                <p className="text-lg opacity-90 mb-6">Shop the trendiest items of 2025</p>
                <Button size="lg" variant="secondary">
                    Shop Now
                </Button>
            </div>
        </section>
    )
}
