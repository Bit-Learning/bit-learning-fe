import { ProjectFeatures } from '@/shared/components/ProjectFeatures'

export function FeatureSection() {
    return (
        <>
            <section className="px-3">
                <div className="container mx-auto max-w-screen-xl space-y-2 border-x px-3 py-5 md:px-8 md:py-14">
                    <h2 className="text-2xl font-bold sm:text-4xl">Everything You Need</h2>
                    <p className="text-lg">Production-ready starter kit with best-in-class tools and patterns</p>
                </div>
            </section>
            <div className="px-3">
                <section className="container mx-auto max-w-screen-xl border-l">
                    <ProjectFeatures />
                </section>
            </div>
        </>
    )
}
