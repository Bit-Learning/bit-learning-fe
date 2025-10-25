import PageMeta from '@/components/seo/page-meta'
import AboutSection from '../component/AboutSection'
import ContactSection from '../component/ContactSection'
import CoursesSection from '../component/CoursesSection'
import HeroSection from '../component/HeroSection'
import PracticeAreaSection from '../component/PracticeAreaSection'

const HomePage: React.FC = () => {
    return (
        <>
            <PageMeta />
            <HeroSection />
            <AboutSection />
            <PracticeAreaSection />
            <CoursesSection />
            <ContactSection />
        </>
    )
}
export default HomePage
