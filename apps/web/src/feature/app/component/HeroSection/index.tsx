import { HeroCarousel } from './HeroCarousel'
import { ServiceSections } from './ServiceSection'

const HeroSection: React.FC = () => {
    return (
        <section className="relative">
            <HeroCarousel />
            <ServiceSections />
        </section>
    )
}

export default HeroSection
