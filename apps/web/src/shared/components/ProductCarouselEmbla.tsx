import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/Card'
import { Carousel, CarouselItem } from '@workspace/ui/components/EmblaCarousel'

const mockProducts = [
    { id: 1, name: 'Minimal Chair', desc: 'Elegant and comfy', price: '$89', img: 'https://picsum.photos/300/200' },
    { id: 2, name: 'Modern Lamp', desc: 'Brighten your room', price: '$49', img: 'https://picsum.photos/301/200' },
    { id: 3, name: 'Cozy Sofa', desc: 'Perfect for relaxation', price: '$299', img: 'https://picsum.photos/302/200' },
    { id: 4, name: 'Wooden Table', desc: 'Classic and durable', price: '$199', img: 'https://picsum.photos/303/200' },
    { id: 5, name: 'Wall Art', desc: 'Bring life to walls', price: '$59', img: 'https://picsum.photos/304/200' },
]

export default function ProductCarouselEmbla() {
    return (
        <section className="container mx-auto px-6 py-12">
            <div className="mb-8 flex flex-col items-center space-y-4">
                <Badge>Featured</Badge>
                <h2 className="text-center text-3xl font-semibold">Shop Highlights</h2>
            </div>

            <Carousel className="pb-6">
                {mockProducts.map(p => (
                    <CarouselItem key={p.id}>
                        <Card className="overflow-hidden transition-shadow hover:shadow-md">
                            <img src={p.img} alt={p.name} className="h-48 w-full object-cover" />
                            <CardHeader>
                                <CardTitle>{p.name}</CardTitle>
                                <CardDescription>{p.desc}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between">
                                <span className="font-semibold">{p.price}</span>
                                <Button size="sm">Buy</Button>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                ))}
            </Carousel>
        </section>
    )
}
