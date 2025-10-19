import { Button } from '@workspace/ui/components/Button'
import { Badge } from '@workspace/ui/components/Badge'
import { Link } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { MEMBER_ITEMS } from '../data/member-data'
import { SYLLABUS_ITEMS } from '../data/syllabus-data'

interface Props {
    title?: string
    description?: string
    badgeText?: string
    viewMoreLink?: string
}

export default function SyllabusGrid({
    title = 'Giáo Án',
    description,
    badgeText = 'Giới thiệu',
    viewMoreLink,
}: Props) {
    const navigate = useNavigate()

    return (
        <section className="container mx-auto py-12 px-6">
            {/* Header */}
            <div className="flex flex-col items-center mb-8 space-y-2">
                <Badge
                    variant="outline"
                    className="text-[#F08701] border-[#F08701] font-semibold tracking-wide uppercase"
                >
                    {badgeText}
                </Badge>
                <h2 className="text-3xl font-extrabold text-center text-[#0C1D37] uppercase tracking-tight">{title}</h2>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {SYLLABUS_ITEMS.map(p => (
                    <div key={p.name} className="group flex flex-col items-center text-left cursor-pointer">
                        <div className="relative w-full overflow-hidden rounded-2xl">
                            <img
                                src={p.img}
                                alt={p.name}
                                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* Optional overlay (if you want subtle effect) */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                        </div>

                        <div className="mt-4">
                            <h3 className="text-md font-semibold text-[#F08701]">{p.syllabusType}</h3>
                            <h1 className="text-xl font-semibold text-[#0C1D37] mt-3 mb-1">{p.name}</h1>
                            <p className="text-gray-500 text-sm">{p.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
