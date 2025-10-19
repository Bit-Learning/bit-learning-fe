import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@workspace/ui/components/carousel'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@workspace/ui/components/Card'
import { Button } from '@workspace/ui/components/Button'
import { Badge } from '@workspace/ui/components/Badge'

const mockProducts = [
    { id: 1, name: 'Minimal Chair', desc: 'Elegant and comfy', price: '$89', img: 'https://picsum.photos/300/200' },
    { id: 2, name: 'Modern Lamp', desc: 'Brighten your room', price: '$49', img: 'https://picsum.photos/301/200' },
    { id: 3, name: 'Cozy Sofa', desc: 'Perfect for relaxation', price: '$299', img: 'https://picsum.photos/302/200' },
    { id: 4, name: 'Wooden Table', desc: 'Classic and durable', price: '$199', img: 'https://picsum.photos/303/200' },
    { id: 5, name: 'Wall Art', desc: 'Bring life to walls', price: '$59', img: 'https://picsum.photos/304/200' },
]

export default function ProductCarousel() {
    return (
        <section className="container mx-auto py-12 px-6">
            <div className="flex flex-col items-center mb-8 space-y-4 text-center">
                <Badge variant="default">Featured</Badge>
                <h2 className="text-3xl font-semibold">Shop Highlights</h2>
            </div>

            <Carousel className="w-full relative">
                <CarouselContent className="-ml-4 flex gap-6">
                    {mockProducts.map(p => (
                        <CarouselItem key={p.id} className="basis-[250px] flex-shrink-0">
                            <Card className="overflow-hidden hover:shadow-md transition-shadow">
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
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2" />
                <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2" />
            </Carousel>
        </section>
    )
}
