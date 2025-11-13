// src/components/PresentationList.js
import { requestUserProfile } from '@/feature/auth/store/auth.actions'
import { selectAuthStateInfo } from '@/feature/auth/store/auth.selectors'
import { useCreateOrder } from '@/feature/order/hook/useOrder'
import { useAppDispatch } from '@/shared/redux/store'
import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent, CardHeader } from '@workspace/ui/components/Card'
import SpinnerLoader from '@workspace/ui/components/loader/SpinnerLoader'
import { toast } from '@workspace/ui/components/Sonner'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useCreatePresentation, usePresentationTemplates, useUserPresentations } from '../hooks/usePresentations'
import { Template } from '../types/presentation.types'

function PresentationList() {
    const dispatch = useAppDispatch()
    const { userInfo, isLoading } = useSelector(selectAuthStateInfo)
    const { data, isLoading: templateLoading, error } = usePresentationTemplates()
    const { data: userPresentations, isLoading: presentationsLoading } = useUserPresentations(userInfo?.id || 0)
    const createPresentation = useCreatePresentation()
    const createOrder = useCreateOrder()
    const [creatingTemplate, setCreatingTemplate] = useState<string | null>(null)
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

    // Filter only active templates
    const activeTemplates = data?.filter(template => template.isActive) || []

    const handleBuyTemplate = async (template: Template) => {
        if (!userInfo?.id) {
            toast.error({
                title: 'Authentication Required',
                description: 'Please login to use templates',
            })
            return
        }

        if (template.price > userInfo.wallet.balance) {
            toast.error({
                title: 'Insufficient Funds',
                description: 'You do not have enough funds in your wallet to buy this template.',
            })
            return
        }

        try {
            setCreatingTemplate(template.name)
            await createOrder.mutateAsync({
                orderDetails: [
                    {
                        productId: template.id,
                        quantity: 1,
                    },
                ],
            })
            dispatch(requestUserProfile())
            await createPresentation.mutateAsync({
                name: template.name.replace(/_/g, ' '),
                description: `Presentation created from ${template.name} template`,
                type: 'SLIDEV',
                templateUrl: `classpath:static/markdown/${template.name}.md`,
                ownerId: userInfo.id,
            })
            toast.success({
                title: 'Success',
                description: 'Buy template successfully! Presentation is being processed...',
            })
        } catch (error: any) {
            toast.error({
                title: 'Error',
                description: error?.response?.data?.message || 'Failed to purchase template',
            })
        } finally {
            setCreatingTemplate(null)
        }
    }

    if (isLoading || templateLoading || presentationsLoading) return <SpinnerLoader />
    if (error) return <div>Error loading templates.</div>

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-2xl font-bold">My Presentations</h1>

            <div className="grid grid-cols-1 gap-6 space-y-3 sm:grid-cols-2 lg:grid-cols-4">
                {userPresentations?.map(pres => (
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

            <div>
                <h2 className="mt-12 mb-4 text-2xl font-bold">Available Presentation Templates (Active Only)</h2>

                {activeTemplates.length === 0 && !templateLoading && (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                        <p className="text-gray-500">No active templates available at the moment</p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {activeTemplates.map((template: Template) => {
                        template.name = template.name.replace('.md', '')
                        const isCreating = creatingTemplate === template.name

                        return (
                            <Card key={template.id} className="p-4">
                                <CardHeader className="flex flex-row items-center justify-between p-0">
                                    <span className="font-semibold capitalize">{template.name.replace(/_/g, ' ')}</span>
                                    <div className="flex items-center gap-2">
                                        {template.price && (
                                            <span className="text-sm font-medium text-gray-500">
                                                {template.price.toLocaleString('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                })}
                                            </span>
                                        )}
                                        <Badge variant="default">Active</Badge>
                                        {isCreating && <Badge variant="secondary">Creating...</Badge>}
                                    </div>
                                </CardHeader>

                                <CardContent className="mt-3 flex flex-col gap-2 p-0">
                                    {template.previewUrl && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPreviewTemplate(template)}
                                        >
                                            👁️ Preview
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        onClick={() => handleBuyTemplate(template)}
                                        isDisabled={isCreating || !userInfo}
                                    >
                                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Buy Template
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Preview Modal */}
                {previewTemplate && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                        onClick={() => setPreviewTemplate(null)}
                    >
                        <div
                            className="relative max-h-[90vh] max-w-[90vw] overflow-auto rounded-lg bg-white p-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setPreviewTemplate(null)}
                                className="absolute top-4 right-4 z-10 rounded-full bg-black/50 px-3 py-1 text-white hover:bg-black/70"
                            >
                                ✕ Close
                            </button>
                            <h3 className="mb-4 text-xl font-bold">
                                Preview: {previewTemplate.name.replace(/_/g, ' ')}
                            </h3>
                            {previewTemplate.previewUrl ? (
                                <iframe
                                    src={previewTemplate.previewUrl}
                                    className="h-[70vh] w-full rounded border"
                                    title={`Preview of ${previewTemplate.name}`}
                                />
                            ) : (
                                <p className="text-gray-500">No preview available</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PresentationList
