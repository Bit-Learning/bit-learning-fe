import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@workspace/ui/components/Card'
import { Button } from '@workspace/ui/components/Button'

const mockProducts = [
    { id: 1, name: 'Minimal Chair', desc: 'Elegant and comfy', price: '$89', img: 'https://picsum.photos/300/200' },
    { id: 2, name: 'Modern Lamp', desc: 'Brighten your room', price: '$49', img: 'https://picsum.photos/301/200' },
    { id: 3, name: 'Cozy Sofa', desc: 'Perfect for relaxation', price: '$299', img: 'https://picsum.photos/302/200' },
    { id: 4, name: 'Wooden Table', desc: 'Classic and durable', price: '$199', img: 'https://picsum.photos/303/200' },
]

export default function ProductGrid() {
    return (
        <section className="container mx-auto py-12 px-6">
            <h2 className="text-3xl font-semibold mb-8 text-center">Featured Products</h2>
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
        </section>
    )
}
