import { apiClient } from '@/shared/lib/apiClient'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/Card'
import { Progress } from '@workspace/ui/components/Progress'
import { toast } from '@workspace/ui/components/Sonner'
import { Document, Packer, Paragraph, TextRun } from 'docx'
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

    const handleDownloadTemplate = async () => {
        // Create Word document with question bank template
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        // MCQ Example
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: '[Info: SubjectCode=TH11_CTST, ClassLevel=11, CurriculumCode=CTST, LessonCode=TH11_CTST_C1_L1, Type=MCQ, Level=EASY]',
                                    color: '0000FF',
                                    bold: true,
                                }),
                            ],
                            spacing: { after: 200 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'Câu 1: Cấu trúc dữ liệu nào lưu trữ các phần tử liền kề nhau trong bộ nhớ?',
                                    bold: true,
                                }),
                            ],
                            spacing: { after: 100 },
                        }),
                        new Paragraph({
                            text: 'A. Mảng (Array)',
                            spacing: { after: 50 },
                        }),
                        new Paragraph({
                            text: 'B. Danh sách liên kết (Linked List)',
                            spacing: { after: 50 },
                        }),
                        new Paragraph({
                            text: 'C. Cây (Tree)',
                            spacing: { after: 50 },
                        }),
                        new Paragraph({
                            text: 'D. Đồ thị (Graph)',
                            spacing: { after: 100 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'Đáp án: A',
                                    color: '008000',
                                    bold: true,
                                }),
                            ],
                            spacing: { after: 400 },
                        }),

                        // ESSAY Example
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: '[Info: SubjectCode=TH11_CTST, ClassLevel=11, CurriculumCode=CTST, LessonCode=TH11_CTST_C1_L1, Type=ESSAY, Level=MEDIUM]',
                                    color: '0000FF',
                                    bold: true,
                                }),
                            ],
                            spacing: { after: 200 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'Câu 2: Nêu một ưu điểm của Mảng (Array) so với Danh sách liên kết (Linked List).',
                                    bold: true,
                                }),
                            ],
                            spacing: { after: 100 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'Đáp án: Truy cập ngẫu nhiên nhanh (O(1)) thông qua chỉ số (index).',
                                    color: '008000',
                                    bold: true,
                                }),
                            ],
                            spacing: { after: 400 },
                        }),

                        // Instructions
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: '─────────────────────────────────────────────────────',
                                    color: 'CCCCCC',
                                }),
                            ],
                            spacing: { before: 400, after: 400 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'HƯỚNG DẪN SỬ DỤNG TEMPLATE',
                                    bold: true,
                                    size: 28,
                                }),
                            ],
                            spacing: { after: 200 },
                        }),
                        new Paragraph({
                            text: '• Mỗi câu hỏi bắt đầu bằng dòng [Info:...] chứa metadata',
                            spacing: { after: 100 },
                        }),
                        new Paragraph({
                            text: '• SubjectCode: Mã môn học (ví dụ: TH11_CTST)',
                            spacing: { after: 100 },
                        }),
                        new Paragraph({
                            text: '• ClassLevel: Khối lớp (ví dụ: 11)',
                            spacing: { after: 100 },
                        }),
                        new Paragraph({
                            text: '• CurriculumCode: Mã chương trình (ví dụ: CTST)',
                            spacing: { after: 100 },
                        }),
                        new Paragraph({
                            text: '• LessonCode: Mã bài học (ví dụ: TH11_CTST_C1_L1)',
                            spacing: { after: 100 },
                        }),
                        new Paragraph({
                            text: '• Type: Loại câu hỏi (MCQ hoặc ESSAY)',
                            spacing: { after: 100 },
                        }),
                        new Paragraph({
                            text: '• Level: Độ khó (EASY, MEDIUM, HARD)',
                            spacing: { after: 200 },
                        }),
                        new Paragraph({
                            text: '• Đối với MCQ: Liệt kê các đáp án A, B, C, D... trên từng dòng',
                            spacing: { after: 100 },
                        }),
                        new Paragraph({
                            text: '• Đối với ESSAY: Chỉ cần câu hỏi và đáp án',
                            spacing: { after: 100 },
                        }),
                        new Paragraph({
                            text: '• Dòng "Đáp án:" chỉ ra đáp án đúng (MCQ: A/B/C/D, ESSAY: câu trả lời chi tiết)',
                            spacing: { after: 100 },
                        }),
                        new Paragraph({
                            text: '• Để thêm câu hỏi mới, copy định dạng trên và thay đổi nội dung',
                            spacing: { after: 100 },
                        }),
                    ],
                },
            ],
        })

        // Generate and download
        const blob = await Packer.toBlob(doc)

        // Download file using browser API
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'question_bank_template.docx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast.success({ title: 'Đã tải template thành công!' })
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
                        <li>Tải xuống file mẫu Word để xem định dạng yêu cầu</li>
                        <li>
                            Mỗi câu hỏi bắt đầu với dòng [Info:...] chứa metadata (SubjectCode, ClassLevel,
                            CurriculumCode, LessonCode, Type, Level)
                        </li>
                        <li>Đối với MCQ: Liệt kê các đáp án A, B, C, D... và ghi rõ đáp án đúng</li>
                        <li>Đối với ESSAY: Chỉ cần câu hỏi và đáp án chi tiết</li>
                        <li>File hỗ trợ: Word (.docx)</li>
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
                                accept=".docx,.doc"
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
                                    <p className="text-muted-foreground text-sm">Hỗ trợ: .docx, .doc (Tối đa 10MB)</p>
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
                            <span>Đảm bảo file của bạn tuân theo đúng định dạng mẫu Word</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>Mỗi câu hỏi phải có dòng [Info:...] ở đầu chứa metadata đầy đủ</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>Type: MCQ (trắc nghiệm) hoặc ESSAY (tự luận)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>Level: EASY (Dễ), MEDIUM (Trung bình), hoặc HARD (Khó)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>SubjectCode, LessonCode phải tồn tại trong hệ thống</span>
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
