import { motion } from 'framer-motion'
import { Button } from '@workspace/ui/components/Button'
import { Badge } from '@workspace/ui/components/Badge'

export default function SlideBanner() {
    return (
        <section className="relative bg-[#F5FAFF] overflow-hidden">
            {/* Subtle background pattern (optional) */}
            <div className="absolute inset-0 opacity-20">
                <svg
                    className="w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                    viewBox="0 0 800 400"
                >
                    <circle cx="100" cy="100" r="200" fill="url(#grad)" />
                    <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#DCE8FF" />
                            <stop offset="100%" stopColor="#EDF3FF" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center px-6 md:px-12 py-16 md:py-24 gap-8">
                {/* LEFT SIDE (TEXT) */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="flex-1 text-left"
                >
                    <Badge className="inline-block mb-4 bg-[#FBDBB11A] text-[#FF8C00] text-sm font-semibold px-4 py-1 rounded-full">
                        Giáo Án
                    </Badge>

                    <h1 className="text-[#14244A] text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                        Dự án STEAM mầm non
                        <br />
                        Phát triển tư duy và
                        <br />
                        Kỹ năng giải quyết vấn đề
                    </h1>
                </motion.div>
            </div>
        </section>
    )
}
