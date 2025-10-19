type SyllabusItem = {
    name: string
    syllabusType: 'GIÁO ÁN MẦM NON' | 'GIÁO ÁN TIỂU HỌC' | 'GIÁO ÁN TRUNG HỌC CƠ SỞ' | 'GIÁO ÁN TRUNG HỌC PHỔ THÔNG'
    description: string
    img: string
    link: string
}

export const SYLLABUS_ITEMS: SyllabusItem[] = [
    {
        name: 'Chương trình PRESTEAM',
        syllabusType: 'GIÁO ÁN MẦM NON',
        description:
            'Bao gồm giáo án chi tiết 1: Chương trình khung theo Bộ. 2: Chương trình tiếng Anh cho STEAM. 3: Dự án STEAM.',
        img: '/presentations/presteam-pc1-1-t.jpg',
        link: '/presentation/innedu-basics',
    },
    {
        name: 'Lập trình Robot',
        syllabusType: 'GIÁO ÁN MẦM NON',
        description:
            'Chương trình lập trình robot đầu tiên tại Việt Nam được cấp chứng nhận của Bộ Giáo dục và Đào Tạo.Chương trình giúp phát triển năng lực tư duy phân tích và tư duy lập trình không cần dùng đến máy tính.',
        img: '/presentations/lap-trinh-robot-pc10-1-t.jpg',
        link: '/presentation/innedu-basics',
    },
    {
        name: 'Tiếng Anh',
        syllabusType: 'GIÁO ÁN MẦM NON',
        description:
            'Chương trình tiếng Anh được thiết kế chi tiết giáo án từng buổi dạy để giúp trẻ phát triển cả 4 năng lực Nghe-Nói-Đọc-Viết hiệu quả cho trẻ mầm non. Chương trình cho trẻ từ 3 tuổi đến 6 tuổi.',
        img: '/presentations/tieng-anh-mam-non-pc11-1-t.jpg',
        link: '/presentation/innedu-basics',
    },
]
