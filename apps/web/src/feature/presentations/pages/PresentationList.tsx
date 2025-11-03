// src/components/PresentationList.js
import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent, CardHeader } from '@workspace/ui/components/Card'
import { useEffect, useState } from 'react'

export enum PresentationType {
    SLIDEV = 'SLIDEV',
    REVEALJS = 'REVEALJS',
    MARKDOWN_RAW = 'MARKDOWN_RAW',
    PPTX = 'PPTX',
}

export interface Presentation {
    id: number
    name: string
    price: number
    isActive: boolean
    type: PresentationType
    storagePath: string
    publicUrl: string
    folderKey: string
    revision: number
    description?: string | null
    ownerId: number
    processing: boolean

    // Optional: common BaseEntity fields
    createdAt?: string
    updatedAt?: string
}

function PresentationList() {
    const [presentations, setPresentations] = useState<Presentation[]>([])
    const [loading, setLoading] = useState(true)

    // Replace '1' with your actual logged-in user's ID from auth
    const userId = 1

    useEffect(() => {
        // Fetch presentations from your Spring Boot API
        fetch(`http://localhost:4004/api/products/presentations/${userId}/list`)
            .then(res => res.json())
            .then(apiResponse => {
                if (apiResponse.status === 200) {
                    setPresentations(apiResponse.data)
                }
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to fetch presentations:', err)
                setLoading(false)
            })
    }, [userId])

    if (loading) {
        return <div>Loading presentations...</div>
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-2xl font-bold">My Presentations</h1>

            <div className="grid grid-cols-1 gap-6 space-y-3 sm:grid-cols-2 lg:grid-cols-4">
                {presentations.map(pres => (
                    <Card key={pres.id} className="p-4">
                        <CardHeader className="flex flex-row items-center justify-between p-0">
                            <span className="font-semibold">
                                Name: {pres.name} | Id: {pres.id}
                            </span>

                            {pres.processing && <Badge variant="secondary">Building...</Badge>}
                        </CardHeader>

                        {!pres.processing && (
                            //Id

                            <CardContent className="mt-3 flex gap-2 p-0">
                                <Link to="/presentations/$id/view" params={{ id: pres.id.toString() }}>
                                    <Button size="sm">View</Button>
                                </Link>

                                <Link to="/presentations/$id/presenter" params={{ id: pres.id.toString() }}>
                                    <Button variant="outline" size="sm">
                                        Presenter
                                    </Button>
                                </Link>

                                <Link to="/presentations/$id/overview" params={{ id: pres.id.toString() }}>
                                    <Button variant="secondary" size="sm">
                                        Overview
                                    </Button>
                                </Link>

                                <a
                                    href={`http://localhost:4004/api/products/presentations/${pres.id}/export`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="ghost" size="sm">
                                        Export PDF
                                    </Button>
                                </a>
                            </CardContent>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default PresentationList
