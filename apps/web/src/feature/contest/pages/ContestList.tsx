import React, { useState } from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import { ContestListContent } from "../components/ContestListContent";
import { ContestListDTO, ContestStatus } from "../types/contest.type";

const mockContests: (ContestListDTO & {
  description?: string;
  durationMinutes?: number;
  progress?: number;
  timeLeft?: string;
  countdown?: {
    d?: number;
    h?: number;
    m?: number;
    s?: number;
  };
  myRank?: number | null;
  myScore?: {
    current: number;
    total: number;
  };
})[] = [
  {
    contestId: "1",
    title: "Olympic Tin học Trẻ - Khối Trung học Cơ sở",
    slug: "olympic-tin-hoc-tre-thcs",
    status: ContestStatus.RUNNING,
    startTime: "2024-03-05T08:00:00Z",
    endTime: "2024-03-05T10:30:00Z",
    problemCount: 5,
    participantCount: 1240,
    isRegistered: true,
    description: "Sử dụng: C++, Python, Pascal",
    durationMinutes: 150,
    progress: 70,
    timeLeft: "45m 12s",
  },
  {
    contestId: "2",
    title: "Lập trình Python mở rộng - Lớp 9",
    slug: "lap-trinh-python-mo-rong-lop-9",
    status: ContestStatus.UPCOMING,
    startTime: "2024-03-05T14:00:00Z",
    endTime: "2024-03-05T15:30:00Z",
    problemCount: 3,
    participantCount: 850,
    isRegistered: true,
    description: "Chủ đề: Cấu trúc dữ liệu & Thuật toán",
    durationMinutes: 90,
    countdown: { h: 2, m: 15, s: 30 },
  },
  {
    contestId: "3",
    title: "Cấp Chứng chỉ Tin học Phổ thông - K9",
    slug: "cap-chung-chi-tin-hoc-pho-thong-k9",
    status: ContestStatus.ENDED,
    startTime: "2023-10-20T08:00:00Z",
    endTime: "2023-10-20T11:00:00Z",
    problemCount: 4,
    participantCount: 2500,
    isRegistered: false,
    description: "Đã diễn ra ngày 20/10/2023",
    durationMinutes: 180,
    myRank: 12,
    myScore: { current: 285, total: 300 },
  },
  {
    contestId: "4",
    title: "Thuật toán quy hoạch động căn bản",
    slug: "thuat-toan-quy-hoach-dong-can-ban",
    status: ContestStatus.UPCOMING,
    startTime: "2024-03-06T08:00:00Z",
    endTime: "2024-03-06T11:00:00Z",
    problemCount: 4,
    participantCount: 420,
    isRegistered: false,
    description: "Chuỗi thi huấn luyện đội tuyển",
    durationMinutes: 180,
    countdown: { d: 1, h: 18, m: 45 },
  },
];

export const ContestListPage: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState<number>(9);

  return (
    <>
      <PageMeta title="Kỳ thi Tin học - Bitlearning" description="Danh sách các kỳ thi lập trình" />
      <ContestListContent
        contests={mockContests}
        viewMode="list"
        selectedGrade={selectedGrade}
        setSelectedGrade={setSelectedGrade}
      />
    </>
  );
};
