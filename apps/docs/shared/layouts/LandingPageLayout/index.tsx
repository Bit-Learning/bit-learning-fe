import { Logo } from '@/shared/components/Logo'
import { HeaderIconButtons } from '@/shared/layouts/HeaderIconButtons'
import { TopNavLinks } from '@/shared/layouts/TopNavLinks'

export function LandingPageLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="bg-background-secondary relative">
            <img
                src="/hero-background.webp"
                alt="Hero Section"
                className="pointer-events-none absolute top-0 left-0 h-[800px] w-full opacity-30 blur-3xl dark:hue-rotate-180 dark:invert"
            />
            <nav className="relative top-0 z-10">
                <div className="px-3">
                    <div className="container mx-auto flex h-16 max-w-screen-xl items-center gap-7 border-x px-3 md:px-8">
                        <Logo withName={false} />
                        <TopNavLinks />
                        <div className="flex-1" />
                        <HeaderIconButtons />
                    </div>
                </div>
            </nav>
            <div className="relative z-10">{children}</div>
        </main>
    )
}
