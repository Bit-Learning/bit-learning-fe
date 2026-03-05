import React, { useState } from "react";
import { Search, Download, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ContestParticipantsProps {
  contestId: string;
}

const MOCK_PARTICIPANTS = [
  {
    userId: 1,
    username: "Nguyễn Văn A",
    email: "nva.student@gmail.com",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBkRfSqkFzTALMza9wkm4-Ld8Rl8kjJWKIv_Mg8m5fHUqD0zJvmLuMIDKFbU5-JO7PABnnMyJwJwQHMS_0L6k7DNKSkI9GRa8xPAzyTQVUp4zFMNiFoXqoiHp0SlV1swIvM5dLDI9ZtezDWfHNdh4-1_M8WtRl_dzBWF_HJNxs56WbZWb0K2lCENaICIsWx7mRqm6bPG_T9Y1X6zO7nIVw5Exsae0xD7hSo6TBZqN74YIH5Q8f55FDZMrTD0O9lY_oYGMF_BptWQ8O7",
    registeredAt: "2026-03-12T08:30:00",
    hasParticipated: true,
  },
  {
    userId: 2,
    username: "Trần Thị Bích",
    email: "bich.tran@edu.vn",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBx8m77WdEN0r6gUINnb4Nqjw9HAxg9_WaXEoyEKXGxdNqrOY-UhW48Es0sRLvf0IuZwZOdvXkAax45EDhmj5R0PzPWnVho1Sz-bv8KgTx5jER4lok_GxiyZdZt44XTp8FEpRxyuZNRbgAq_txh02coXafH1TAng3mbAu3s1Rmky1sAcO48nVDSKLHq_VP8ussWgEQMBjlPtn-XfwNfMFebHZ4vgGAKVq3aTjCQBSIx__E6RLkS6thKMT7YTkeOEhNV1zmjGbbR_Nff",
    registeredAt: "2026-03-12T09:15:00",
    hasParticipated: false,
  },
  {
    userId: 3,
    username: "Lê Hoàng Nam",
    email: "namlh.dev@hotmail.com",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBuv9THuKaQqP_KXQSutdN0ukbk-U8qiXJTL6AV8yjiXhmFKBkQT30HS1NtAlCsV6Kgyy8i7gkQeaOlchrbldI1oZC52TEtx__ZsNAjgXYYDXQ-ZNt-OCw1RxHRnqNHTOII7BEwJM8bPVc-gkjR0UL0i0ToN5UBXj7OoGbm_DcbGD934zumuBmF5kxUqvVp-7D-rQjaQh2-6BtEDftqG-jhlMER5h1_9Wbgy4I8sg-CupbG_p8sMotdQNxsI9LUIYLVNplzYCK96pK6",
    registeredAt: "2026-03-11T22:45:00",
    hasParticipated: true,
  },
  {
    userId: 4,
    username: "Phạm Minh Anh",
    email: "anh.pm@outlook.com",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDavb7gNG_ujRfzuYvJN5teWESvcgM0NAFBtpQEMyybmNWi6THHuae1NcY1nop_ih24cFNq5EcHUKD_RscCVYYay1BHWhEo0Z0okrd0XZIR5CpfKRvQfGLRlTn84ehdvpXTdwnOSwCDm9UUn8oMQH5fZ7jC_TWKh8y1_QZSBpxljP-S7XE8dga16KQmLqT2gVXjsyDvpxlxNWSys8y7ljTGRzMd2-JX3o2zSTpmBjklwBtF19jb5IDavbK9GxI4Lyvn0tjs4Jv9OtSZ",
    registeredAt: "2026-03-11T20:10:00",
    hasParticipated: true,
  },
  {
    userId: 5,
    username: "Vũ Quốc Trung",
    email: "trungvq.it@student.vn",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBb9XdpXArheACK70jaLfr8SjhbGcZthbWwIW4d7DpXbIkw70TgBP9RXiTZbBtb6mfkwEtAPHVwLb4zrwOHhGCxla1iHnJJxHLYa2GEeXi0a1LUlQjNUMIvT_6iLZb25KXISM3CCYnJBzPi7DxLZcvwHjehzsJHDX6LF2CCOYraOLp1Mcs36QYP_RNkr4fBbNu0gkYFpKneKvErsqGagtoWL6QQCz8qrbTEr0Uvd-uKxQRd1k8NsyGW-SSEaGD7HlyO_UMVCQsRgtnj",
    registeredAt: "2026-03-10T14:20:00",
    hasParticipated: false,
  },
];

export const ContestParticipants: React.FC<ContestParticipantsProps> = ({ contestId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const participants = MOCK_PARTICIPANTS;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const filteredParticipants = participants.filter(
    (p) =>
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Danh sách thí sinh ({participants.length})
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Danh sách người dùng đã đăng ký tham gia cuộc thi
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm thí sinh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất danh sách (CSV)
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Thí sinh
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Email
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Ngày đăng ký
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredParticipants.map((participant) => (
                  <tr
                    key={participant.userId}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                          <AvatarImage src={participant.avatar} alt={participant.username} />
                          <AvatarFallback>
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{participant.username}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            ID: #BT{10234 + participant.userId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-300">{participant.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {formatDateTime(participant.registeredAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {participant.hasParticipated ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-100 dark:border-green-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Đã tham gia
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Chưa tham gia
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:text-blue-700 text-sm font-bold transition-colors">
                        Xem hồ sơ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Đang hiển thị{" "}
          <span className="font-semibold text-slate-900 dark:text-white">1 - {filteredParticipants.length}</span> của{" "}
          <span className="font-semibold text-slate-900 dark:text-white">{participants.length}</span> thí sinh
        </p>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
            disabled
          >
            <span className="material-icons-round">chevron_left</span>
          </button>
          <button className="w-10 h-10 rounded-lg bg-primary text-white font-bold text-sm">1</button>
          <button
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
            disabled
          >
            <span className="material-icons-round">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};
