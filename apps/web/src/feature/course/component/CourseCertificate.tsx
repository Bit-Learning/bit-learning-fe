import React, { useRef, useState } from "react";
import { Award, Download, Share2, Upload, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { cn } from "@workspace/ui/lib/utils";
import { useCertificate, useDownloadCertificate, useVerifyCertificate } from "../queries/useCourse";

interface CourseCertificateProps {
  courseId: number;
  courseName: string;
  progressPercentage: number;
}

export const CourseCertificate: React.FC<CourseCertificateProps> = ({ courseId, courseName, progressPercentage }) => {
  const isCompleted = progressPercentage >= 100;
  const [showVerify, setShowVerify] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    isValid: boolean;
    studentName?: string;
    courseName?: string;
    completedAt?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: certificateUrl, isLoading: certLoading } = useCertificate(courseId, isCompleted);
  const { mutate: download, isPending: downloading } = useDownloadCertificate();
  const { mutate: verify, isPending: verifying } = useVerifyCertificate();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleVerifyFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVerifyResult(null);
    verify(file, {
      onSuccess: (data) => setVerifyResult(data ?? null),
      onError: () => setVerifyResult({ isValid: false }),
    });
    e.target.value = "";
  };

  if (!isCompleted) {
    return <></>;
  }

  return (
    <Card className="overflow-hidden border-2 border-amber-200 bg-amber-50 ">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Award className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900">Chứng chỉ hoàn thành</h3>
            <p className="text-sm text-amber-700">Bạn đã hoàn thành khóa học này</p>
          </div>
        </div>

        <div className="mb-5 overflow-hidden rounded-xl border-2 border-amber-200 bg-white shadow-md">
          {certLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : certificateUrl ? (
            <img src={certificateUrl} alt={`Chứng chỉ ${courseName}`} className="w-full object-contain" />
          ) : (
            <div className="flex h-48 items-center justify-center text-slate-400 text-sm">Không thể tải chứng chỉ</div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white gap-2"
            onClick={() => download(courseId)}
            isDisabled={downloading}
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Tải xuống
          </Button>
          <Button
            variant="outline"
            className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            Chia sẻ
          </Button>
        </div>

        <div className="mt-4 border-t border-amber-200 pt-4">
          <button
            className="text-sm text-amber-700 underline-offset-2 hover:underline cursor-pointer"
            onClick={() => setShowVerify(!showVerify)}
          >
            Xác minh chứng chỉ của người khác
          </button>

          {showVerify && (
            <div className="mt-3 space-y-3">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleVerifyFile} />
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 border-amber-300 text-amber-700"
                onClick={() => fileInputRef.current?.click()}
                isDisabled={verifying}
              >
                {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {verifying ? "Đang xác minh..." : "Tải lên chứng chỉ cần xác minh"}
              </Button>

              {verifyResult && (
                <div
                  className={cn(
                    "rounded-lg border p-3 text-sm",
                    verifyResult.isValid
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-rose-200 bg-rose-50 text-rose-800",
                  )}
                >
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    {verifyResult.isValid ? (
                      <>
                        <CheckCircle className="h-4 w-4" /> Chứng chỉ hợp lệ
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" /> Chứng chỉ không hợp lệ
                      </>
                    )}
                  </div>
                  {verifyResult.isValid && (
                    <div className="space-y-0.5 text-xs">
                      {verifyResult.studentName && (
                        <p>
                          Học viên: <span className="font-medium">{verifyResult.studentName}</span>
                        </p>
                      )}
                      {verifyResult.courseName && (
                        <p>
                          Khóa học: <span className="font-medium">{verifyResult.courseName}</span>
                        </p>
                      )}
                      {verifyResult.completedAt && (
                        <p>
                          Hoàn thành:{" "}
                          <span className="font-medium">
                            {new Date(verifyResult.completedAt).toLocaleDateString("vi-VN")}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
