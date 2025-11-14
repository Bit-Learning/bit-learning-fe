import { apiClient } from '@/shared/lib/apiClient'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/Card'
import { Progress } from '@workspace/ui/components/Progress'
import { toast } from '@workspace/ui/components/Sonner'
import { AlertCircle, ArrowLeft, CheckCircle, Download, FileSpreadsheet, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

export default function ImportQuestionBank() {
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const queryClient = useQueryClient()

    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [importSuccess, setImportSuccess] = useState(false)

    // Import mutation
    const importMutation = useMutation({
        ...apiClient.question.importQuestions(),
        onSuccess: () => {
            setUploadProgress(100)
            setImportSuccess(true)
            queryClient.invalidateQueries({ queryKey: ['questions'] })
            toast.success({ title: 'Import câu hỏi thành công!' })
        },
        onError: (error: any) => {
            setUploadProgress(0)
            toast.error({ title: 'Lỗi khi import', description: error.message })
        },
    })

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setUploadedFile(file)
            setImportSuccess(false)
        }
    }

    const handleUpload = async () => {
        if (!uploadedFile) return

        // Simulate progress
        setUploadProgress(0)
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval)
                    return 90
                }
                return prev + 10
            })
        }, 200)

        // Call API
        try {
            await importMutation.mutateAsync(uploadedFile)
            clearInterval(interval)
        } catch (error) {
            clearInterval(interval)
        }
    }

    const handleReset = () => {
        setUploadedFile(null)
        setUploadProgress(0)
        setImportSuccess(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleDownloadTemplate = () => {
        // Create a sample CSV/Excel template
        const csvContent = `Question,Answer,Type,Level,Lesson ID,Subject ID,Tags
"What is 2+2?","4","MCQ","EASY",1,1,"math,basic"
"Solve x^2 = 4","x = ±2","ESSAY","MEDIUM",1,1,"algebra"
`
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'question_bank_template.csv'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    }

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <Button variant="ghost" onClick={() => navigate({ to: '/matrices' })} className="mb-4 gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </Button>
                <h1 className="mb-2 text-4xl font-bold">Import Question Bank</h1>
                <p className="text-muted-foreground">Nhập ngân hàng câu hỏi từ file Excel hoặc CSV</p>
            </div>

            {/* Instructions */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Hướng dẫn import</CardTitle>
                </CardHeader>
                <CardContent>
                    <ol className="list-inside list-decimal space-y-2 text-sm">
                        <li>Tải xuống file mẫu để xem định dạng yêu cầu</li>
                        <li>Điền thông tin câu hỏi vào file theo đúng định dạng</li>
                        <li>File hỗ trợ: Excel (.xlsx, .xls) hoặc CSV (.csv)</li>
                        <li>Các cột bắt buộc: Question, Answer, Type, Level, Subject ID</li>
                        <li>Tải file lên và hệ thống sẽ tự động xử lý</li>
                    </ol>
                    <Button variant="outline" className="mt-4 gap-2" onClick={handleDownloadTemplate}>
                        <Download className="h-4 w-4" />
                        Tải file mẫu
                    </Button>
                </CardContent>
            </Card>

            {/* Upload Section */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Upload file</CardTitle>
                    <CardDescription>Chọn file chứa ngân hàng câu hỏi</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* File Input */}
                        <div
                            className="hover:border-primary cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <FileSpreadsheet className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                            {uploadedFile ? (
                                <div>
                                    <p className="font-medium">{uploadedFile.name}</p>
                                    <p className="text-muted-foreground text-sm">
                                        {(uploadedFile.size / 1024).toFixed(2)} KB
                                    </p>
                                    {importSuccess && (
                                        <div className="mt-2 flex items-center justify-center gap-2 text-green-600">
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="text-sm">Import thành công!</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-2 font-medium">Click để chọn file hoặc kéo thả vào đây</p>
                                    <p className="text-muted-foreground text-sm">
                                        Hỗ trợ: .xlsx, .xls, .csv (Tối đa 10MB)
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Upload Progress */}
                        {importMutation.isPending && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Đang xử lý...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} />
                            </div>
                        )}

                        {/* Error Message */}
                        {importMutation.isError && (
                            <div className="flex items-center gap-2 rounded bg-red-50 p-3 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">
                                    Có lỗi xảy ra khi import. Vui lòng kiểm tra file và thử lại.
                                </span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                onClick={handleUpload}
                                isDisabled={!uploadedFile || importMutation.isPending || importSuccess}
                                className="gap-2"
                            >
                                <Upload className="h-4 w-4" />
                                {importMutation.isPending ? 'Đang xử lý...' : 'Bắt đầu import'}
                            </Button>
                            {(uploadedFile || importSuccess) && !importMutation.isPending && (
                                <Button variant="outline" onClick={handleReset}>
                                    Chọn file khác
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Success Message */}
            {importSuccess && (
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />
                            <div className="flex-1">
                                <h3 className="mb-1 font-semibold text-green-900">Import thành công!</h3>
                                <p className="mb-4 text-sm text-green-800">
                                    Ngân hàng câu hỏi đã được nhập vào hệ thống. Bạn có thể xem danh sách câu hỏi hoặc
                                    tiếp tục import file khác.
                                </p>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => navigate({ to: '/matrices' })}>
                                        Quay về danh sách
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={handleReset}>
                                        Import thêm file
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Lưu ý</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>Đảm bảo file của bạn tuân theo đúng định dạng mẫu</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>Question Type: MCQ (trắc nghiệm) hoặc ESSAY (tự luận)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>Question Level: EASY, MEDIUM, hoặc HARD</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>Subject ID và Lesson ID phải tồn tại trong hệ thống</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>Kích thước file tối đa: 10MB</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
