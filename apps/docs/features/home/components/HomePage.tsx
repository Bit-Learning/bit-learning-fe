import { FeatureSection } from '@/features/home/components/FeatureSection'
import { FooterSection } from '@/features/home/components/FooterSection'
import { HeroSection } from '@/features/home/components/HeroSection'
import { Separator } from '@workspace/ui/components/Separator'

export function HomePage() {
    return (
        <>
            <HeroSection />
            <Separator className="opacity-50" />
            <FeatureSection />
            <Separator className="opacity-50" />
            <FooterSection />
        </>
    )
}
