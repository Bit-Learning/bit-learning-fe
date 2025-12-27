import { Button } from '@workspace/ui/components/Button'
import { Card } from '@workspace/ui/components/Card'
import { AlertTriangle, CheckCircle, X } from 'lucide-react'

interface PublishCourseModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    isPublishing: boolean
    courseName: string
    isLoading: boolean
}

export const PublishCourseModal = ({
    isOpen,
    onClose,
    onConfirm,
    isPublishing,
    courseName,
    isLoading,
}: PublishCourseModalProps) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <Card className="relative z-10 w-full max-w-xl p-5">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 cursor-pointer text-gray-400 hover:text-gray-600"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        {isPublishing ? (
                            <CheckCircle className="h-6 w-6 text-blue-600" />
                        ) : (
                            <AlertTriangle className="h-6 w-6 text-orange-500" />
                        )}
                    </div>

                    <h3 className="text-lg font-semibold">
                        {isPublishing ? 'Xuất bản khóa học' : 'Hủy xuất bản khóa học'}
                    </h3>

                    <p className="text-md mt-2 text-gray-600">
                        {isPublishing ? (
                            <>
                                Bạn có chắc chắn muốn xuất bản khóa học{' '}
                                <span className="font-semibold text-gray-900">"{courseName}"</span>?
                                <br />
                                <span className="mt-2 block">
                                    Khóa học sẽ được hiển thị công khai và học viên có thể đăng ký.
                                </span>
                            </>
                        ) : (
                            <>
                                Bạn có chắc chắn muốn hủy xuất bản khóa học{' '}
                                <span className="font-semibold text-gray-900">"{courseName}"</span>?
                                <br />
                                <span className="mt-2 block text-orange-600">
                                    Khóa học sẽ không còn hiển thị công khai.
                                </span>
                            </>
                        )}
                    </p>
                </div>

                <div className="mt-4 flex justify-center gap-3">
                    <Button variant="outline" onClick={onClose} isDisabled={isLoading}>
                        Hủy
                    </Button>
                    <Button
                        onClick={onConfirm}
                        isDisabled={isLoading}
                        className={isPublishing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'}
                    >
                        {isLoading ? 'Đang xử lý...' : isPublishing ? 'Xuất bản' : 'Hủy xuất bản'}
                    </Button>
                </div>
            </Card>
        </div>
    )
}
