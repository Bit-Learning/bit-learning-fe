import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Clock, FileText, Play, Plus, Pencil, Trash2, History, Settings } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/Card";
import { Badge } from "@workspace/ui/components/Badge";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { Tab, TabList, TabPanel, Tabs } from "@workspace/ui/components/Tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/Table";
import { useMatrixDetail, useMatrixVersions, useDeleteMatrix, useToggleMatrixActive } from "../queries/useMatrix";
import MatrixFormModal from "./MatrixFormModal";
import VersionFormModal from "./VersionFormModal";

const MatrixDetailContent: React.FC = () => {
  const { id } = useParams({ from: "/_layout/matrices/$id" });
  const navigate = useNavigate();
  const matrixId = parseInt(id);

  const [editModal, setEditModal] = useState(false);
  const [versionModal, setVersionModal] = useState(false);

  const { data: matrix, isLoading } = useMatrixDetail(matrixId);
  const { data: versions } = useMatrixVersions(matrixId);
  const { mutate: deleteMatrix, isPending: deleting } = useDeleteMatrix();
  const { mutate: toggleActive } = useToggleMatrixActive();

  const handleDelete = () => {
    deleteMatrix(matrixId, { onSuccess: () => navigate({ to: "/matrices" }) });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!matrix) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">Không tìm thấy ma trận</p>
            <Button variant="outline" onClick={() => navigate({ to: "/matrices" })}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate({ to: "/matrices" })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{matrix.name}</h1>
              <Badge variant={matrix.isActive ? "default" : "secondary"}>
                {matrix.isActive ? "Hoạt động" : "Tạm dừng"}
              </Badge>
              <Badge variant="outline">{matrix.code}</Badge>
            </div>
            <p className="text-muted-foreground">Môn học: {matrix.subject?.name}</p>
            {matrix.description && <p className="text-sm text-muted-foreground mt-1">{matrix.description}</p>}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => toggleActive({ id: matrixId, isActive: !matrix.isActive })}>
              <Settings className="h-4 w-4 mr-2" />
              {matrix.isActive ? "Tạm dừng" : "Kích hoạt"}
            </Button>
            <Button variant="outline" onClick={() => setEditModal(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Sửa
            </Button>
            <Button variant="outline" className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa
            </Button>
            <Button onClick={() => navigate({ to: "/matrices/$id/generate", params: { id: id } })}>
              <Play className="h-4 w-4 mr-2" />
              Tạo đề thi
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{matrix.duration}</p>
              <p className="text-sm text-muted-foreground">Phút</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{matrix.totalScore}</p>
              <p className="text-sm text-muted-foreground">Tổng điểm</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
              <History className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{versions?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Versions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs>
        <TabList>
          <Tab id="versions">Versions ({versions?.length || 0})</Tab>
          <Tab id="config">Cấu hình</Tab>
        </TabList>

        <TabPanel id="versions" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Danh sách versions</CardTitle>
              <Button size="sm" onPress={() => setVersionModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo version
              </Button>
            </CardHeader>
            <CardContent>
              {!versions?.length ? (
                <div className="text-center py-8 text-muted-foreground">Chưa có version nào</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Tên</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="w-24"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versions.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          <Badge variant="outline">v{v.versionNo}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{v.name || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{v.notes || "-"}</TableCell>
                        <TableCell>{new Date(v.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Xem
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel id="config" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cấu hình</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Môn học</p>
                  <p className="font-medium">{matrix.subject?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mã môn</p>
                  <p className="font-medium">{matrix.subject?.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="font-medium">{new Date(matrix.createdAt).toLocaleDateString("vi-VN")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cập nhật lần cuối</p>
                  <p className="font-medium">{new Date(matrix.updatedAt).toLocaleDateString("vi-VN")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabPanel>
      </Tabs>

      {/* Modals */}
      <MatrixFormModal isOpen={editModal} onClose={() => setEditModal(false)} data={matrix} />
      <VersionFormModal
        isOpen={versionModal}
        onClose={() => setVersionModal(false)}
        matrixId={matrixId}
        totalScore={matrix.totalScore}
      />
    </div>
  );
};

export default MatrixDetailContent;
