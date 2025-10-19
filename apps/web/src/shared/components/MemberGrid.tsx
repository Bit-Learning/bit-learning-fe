import { Button } from '@workspace/ui/components/Button'
import { Badge } from '@workspace/ui/components/Badge'
import { Link } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { MEMBER_ITEMS } from '../data/member-data'

interface Props {
    title?: string
    description?: string
    badgeText?: string
    viewMoreLink?: string
}

export default function MemberGrid({
    title = 'NHỮNG CHUYÊN GIA INNEDU',
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {MEMBER_ITEMS.map(p => (
                    <div key={p.name} className="group flex flex-col items-center text-center cursor-pointer">
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
                            <h3 className="text-lg font-semibold text-[#0C1D37]">{p.name}</h3>
                            <p className="text-gray-500 text-sm">{p.role}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* View More Button */}
            {viewMoreLink && (
                <div className="flex justify-center mt-10">
                    <Button
                        size="lg"
                        onClick={() => navigate({ to: viewMoreLink })}
                        className="bg-[#F08701] hover:bg-[#d87500] text-white rounded-full px-8 py-5 font-medium shadow-sm transition-colors"
                    >
                        <Link size={16} className="mr-2" /> Xem thêm
                    </Button>
                </div>
            )}
        </section>
    )
}
