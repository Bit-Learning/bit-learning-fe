import React, { useState } from "react";
import { Search, Download, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ContestParticipantsProps {
  contestId: string;
}

export const ContestParticipants: React.FC<ContestParticipantsProps> = ({ contestId }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // TODO: Replace with real query when API is ready
  // const { data: participants, isLoading } = useContestParticipants(contestId);
  const participants: any[] = [];
  const isLoading = false;

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Đang tải danh sách thí sinh...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Danh sách thí sinh ({participants.length})</h3>
          <p className="text-sm text-gray-600">Danh sách người dùng đã đăng ký tham gia cuộc thi</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm thí sinh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button variant="outline" className="border-gray-300">
            <Download className="h-4 w-4 mr-2" />
            Xuất danh sách (CSV)
          </Button>
        </div>
      </div>

      <Card className="bg-white p-0 border-gray-200">
        <CardContent className="p-0">
          {!participants || participants.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Chưa có thí sinh nào</h4>
              <p className="text-sm text-gray-600">Chưa có người dùng đăng ký cuộc thi này</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">Thí sinh</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">Email</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">Ngày đăng ký</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">Trạng thái</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600 text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredParticipants.map((participant) => (
                    <tr key={participant.userId} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 ring-2 ring-transparent group-hover:ring-blue-200 transition-all">
                            <AvatarImage src={participant.avatar} alt={participant.username} />
                            <AvatarFallback className="bg-gray-100 text-gray-700">
                              <User className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{participant.username}</p>
                            <p className="text-xs text-gray-500">ID: #BT{10234 + participant.userId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{participant.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{formatDateTime(participant.registeredAt)}</span>
                      </td>
                      <td className="px-6 py-4">
                        {participant.hasParticipated ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                            Đã tham gia
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Chưa tham gia
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-bold transition-colors">
                          Xem hồ sơ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {filteredParticipants.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Đang hiển thị <span className="font-semibold text-gray-900">1 - {filteredParticipants.length}</span> của{" "}
            <span className="font-semibold text-gray-900">{participants.length}</span> thí sinh
          </p>
        </div>
      )}
    </div>
  );
};
