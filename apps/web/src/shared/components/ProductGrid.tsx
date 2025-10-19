import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@workspace/ui/components/Card'
import { Button } from '@workspace/ui/components/Button'
import { Badge } from '@workspace/ui/components/Badge'
import { Link } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

const mockProducts = [
    { id: 1, name: 'Minimal Chair', desc: 'Elegant and comfy', price: '$89', img: 'https://picsum.photos/300/200' },
    { id: 2, name: 'Modern Lamp', desc: 'Brighten your room', price: '$49', img: 'https://picsum.photos/301/200' },
    { id: 3, name: 'Cozy Sofa', desc: 'Perfect for relaxation', price: '$299', img: 'https://picsum.photos/302/200' },
    { id: 4, name: 'Wooden Table', desc: 'Classic and durable', price: '$199', img: 'https://picsum.photos/303/200' },
]

interface Props {
    title?: string
    description?: string
    badgeText?: string
    viewMoreLink?: string
}

export default function ProductGrid({
    title = 'Featured Products',
    description,
    badgeText = 'Text',
    viewMoreLink,
}: Props) {
    const navigate = useNavigate()

    return (
        <section className="container mx-auto py-12 px-6">
            <div className="flex flex-col items-center mb-8 space-y-4">
                <Badge variant="default">{badgeText}</Badge>
                <h2 className="text-3xl font-semibold  text-center">{title}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockProducts.map(p => (
                    <Card key={p.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <img src={p.img} alt={p.name} className="w-full h-48 object-cover" />
                        <CardHeader>
                            <CardTitle>{p.name}</CardTitle>
                            <CardDescription>{p.desc}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <span className="font-semibold">{p.price}</span>
                            <Button size="sm">Buy</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {viewMoreLink && (
                <div className="flex flex-col items-center mb-8 space-y-4 mt-12">
                    <Button size="lg" variant="default" onClick={() => navigate({ to: viewMoreLink })}>
                        <Link size={16} /> Xem thêm
                    </Button>
                </div>
            )}
        </section>
    )
}
