// src/components/PresentationList.js
import { selectAuthStateInfo } from '@/feature/auth/store/auth.selectors'
import { useCreateOrder } from '@/feature/order/hook/useOrder'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card } from '@workspace/ui/components/Card'
import Loader from '@workspace/ui/components/loader/OrangeBlockLoader'
import { toast } from '@workspace/ui/components/Sonner'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
    useAvailablePresentationTemplates,
    useCreatePresentation,
    useUserPresentations,
} from '../hooks/usePresentations'
import '../styles/index.css'
import { Template } from '../types/presentation.types'

function PresentationList() {
    const { userInfo, isLoading } = useSelector(selectAuthStateInfo)
    const { data: activeTemplates, isLoading: templateLoading, error } = useAvailablePresentationTemplates()
    const { data: userPresentations, isLoading: presentationsLoading } = useUserPresentations(userInfo?.id || 0)
    const createPresentation = useCreatePresentation()
    const createOrder = useCreateOrder()
    const [creatingTemplate, setCreatingTemplate] = useState<string | null>(null)
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

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

    if (isLoading || templateLoading || presentationsLoading) return <Loader />
    if (error) return <div>Error loading templates.</div>

    return (
        <div className="container mx-auto px-6 py-12">
            <div>
                <h2 className="mb-4 mt-12 text-2xl font-bold">Các mẫu thuyết trình có sẵn</h2>

                {activeTemplates?.length === 0 && !templateLoading && (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                        <p className="text-gray-500">Không có dữ liệu</p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {activeTemplates &&
                        activeTemplates.map((template: Template) => {
                            template.name = template.name.replace('.md', '')
                            const isCreating = creatingTemplate === template.name
                            const canAfford = userInfo && template.price <= userInfo.wallet.balance

                            return (
                                <Card
                                    key={template.id}
                                    className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                >
                                    {/* Status Badge - Top Right Corner */}
                                    {isCreating && (
                                        <div className="absolute right-3 top-3 z-10">
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Đang tạo...
                                            </Badge>
                                        </div>
                                    )}

                                    {/* Preview Image/Placeholder */}
                                    <div className="bg-linear-to-br relative h-48 overflow-hidden from-blue-50 to-indigo-100">
                                        {template.previewUrl ? (
                                            <iframe
                                                src={template.previewUrl}
                                                className="scale- pointer-events-none h-full w-full transform"
                                                title={`Preview thumbnail of ${template.name}`}
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <svg
                                                    className="h-20 w-20 text-gray-300"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                        {/* Gradient Overlay */}
                                        <div className="bg-linear-to-t absolute inset-0 from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5">
                                        {/* Template Name */}
                                        <h3 className="mb-3 text-lg font-bold capitalize leading-tight text-gray-900">
                                            {template.name.replace(/_/g, ' ')}
                                        </h3>

                                        {/* Price Tag */}
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-bold text-blue-600">
                                                    {template.price.toLocaleString('vi-VN')}
                                                </span>
                                                <span className="text-sm text-gray-500">₫</span>
                                            </div>
                                            {!canAfford && userInfo && (
                                                <Badge variant="destructive" className="text-xs">
                                                    Không đủ tiền
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            {/* Preview Button */}
                                            {template.previewUrl ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPreviewTemplate(template)}
                                                    className="flex-1 transition-colors hover:bg-gray-100"
                                                    isDisabled={isCreating}
                                                >
                                                    <svg
                                                        className="mr-1.5 h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                        />
                                                    </svg>
                                                    Xem trước
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    isDisabled
                                                    className="flex-1 cursor-not-allowed opacity-50"
                                                >
                                                    <span className="text-xs text-gray-400">Chưa có preview</span>
                                                </Button>
                                            )}

                                            {/* Buy Button */}
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => handleBuyTemplate(template)}
                                                isDisabled={isCreating || !userInfo || !canAfford}
                                                className={`flex-1 font-semibold transition-all ${
                                                    !userInfo
                                                        ? 'cursor-not-allowed bg-gray-300'
                                                        : !canAfford
                                                          ? 'cursor-not-allowed bg-red-400 hover:bg-red-500'
                                                          : 'bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                                }`}
                                            >
                                                {isCreating ? (
                                                    <>
                                                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                                        Đang xử lý...
                                                    </>
                                                ) : !userInfo ? (
                                                    <>
                                                        <svg
                                                            className="mr-1.5 h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                                            />
                                                        </svg>
                                                        Đăng nhập
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg
                                                            className="mr-1.5 h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                                            />
                                                        </svg>
                                                        Mua ngay
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {/* User Not Logged In Message */}
                                        {!userInfo && (
                                            <p className="mt-3 text-center text-xs text-gray-500">
                                                Vui lòng đăng nhập để mua mẫu
                                            </p>
                                        )}
                                    </div>
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
                            className="relative max-h-[90vh] max-w-[100vw] overflow-auto rounded-lg bg-white p-4"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* <button
                                onClick={() => setPreviewTemplate(null)}
                                className="absolute right-0 top-0 z-10 rounded-full bg-black/50 px-3 py-1 text-white hover:bg-black/70"
                            >
                                ✕ Close
                            </button> */}
                            {previewTemplate.previewUrl ? (
                                <iframe
                                    src={previewTemplate.previewUrl}
                                    className="h-[40vh] w-full rounded border"
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
