import React from 'react'
import { useLectureText } from '../queries/useLecture'

interface TextContentProps {
    lectureId: number
}

const TextContent: React.FC<TextContentProps> = ({ lectureId }) => {
    const { data, isLoading, error } = useLectureText(lectureId)

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center bg-gray-900">
                <div className="text-gray-400">Đang tải...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-full items-center justify-center bg-gray-900">
                <div className="text-red-400">Lỗi khi tải nội dung bài giảng</div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex h-full items-center justify-center bg-gray-900">
                <div className="text-gray-400">Không có nội dung</div>
            </div>
        )
    }

    const { lecture, content } = data

    return (
        <div className="h-full overflow-y-auto bg-gray-900 p-8">
            <div className="mx-auto max-w-4xl">
                <div className="rounded-lg bg-gray-800 p-8">
                    <h1 className="mb-6 text-3xl font-bold text-white">{lecture.title}</h1>

                    <div className="prose prose-invert max-w-none">
                        <div className="space-y-4 text-gray-300">
                            {content.split('\n').map(
                                (paragraph, index) =>
                                    paragraph.trim() && (
                                        <p key={index} className="leading-relaxed">
                                            {paragraph}
                                        </p>
                                    ),
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TextContent
