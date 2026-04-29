export const navItems = [
  {
    title: "Trang chủ",
    to: "/",
  },
  {
    title: "Khóa học Online",
    to: "/courses",
  },
  {
    title: "Học tập",
    items: [
      {
        title: "Bài tập thực hành",
        to: "/problem",
        description: "Luyện tập và giải các bài tập theo từng chủ đề.",
      },
      {
        title: "Đề thi",
        to: "/exams",
        description: "Làm đề thi thử và kiểm tra đánh giá năng lực.",
      },
      {
        title: "Cuộc thi",
        to: "/contests",
        description: "Tham gia các cuộc thi lập trình và thử thách kỹ năng.",
      },
    ],
  },
  {
    title: "Cộng đồng",
    items: [
      {
        title: "Diễn đàn",
        to: "/forum",
        description: "Trao đổi kiến thức và hỏi đáp cùng cộng đồng.",
      },
      {
        title: "Đội ngũ hướng dẫn",
        to: "/instructors",
        description: "Gặp gỡ và học hỏi từ các chuyên gia trong ngành.",
      },
    ],
  },
  {
    title: "Công cụ học tập",
    items: [
      {
        title: "Trợ lý AI",
        to: "/chat-ai",
        description: "Trợ lý AI hỗ trợ học tập và soạn tài liệu.",
      },
      {
        title: "Trò chơi học tập",
        to: "/games",
        description: "Học lập trình qua các trò chơi tương tác.",
      },
    ],
  },
  {
    title: "Về chúng tôi",
    to: "/about",
  },
];
