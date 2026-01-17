import { useState, useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Save, Loader2, Check } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/Form";
import { Input } from "@workspace/ui/components/Input";
import { Textarea } from "@workspace/ui/components/Textarea";
import { useMatrixDetail, useCreateMatrix, useUpdateMatrix, useCreateVersion } from "../queries/useMatrix";
import MatrixDetailTable from "./MatrixDetailTable";
import type { TMatrixDetailRequest } from "../types/matrix.type";
import { useSubjectsList } from "../queries/useSubject";

const step1Schema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên"),
  code: z.string().min(1, "Vui lòng nhập mã"),
  description: z.string().optional(),
  duration: z.number().min(1, "Thời gian phải > 0"),
  totalScore: z.number().min(0),
  subjectId: z.number().min(1, "Vui lòng chọn môn học"),
});

const step2Schema = z.object({
  versionName: z.string().min(1, "Vui lòng nhập tên version"),
  versionNotes: z.string().optional(),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

const CreateMatrixContent: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { id?: string };
  const matrixId = params.id ? parseInt(params.id) : undefined;
  const isEdit = !!matrixId;

  const [step, setStep] = useState(1);
  const [createdMatrixId, setCreatedMatrixId] = useState<number | undefined>(matrixId);
  const [matrixDetails, setMatrixDetails] = useState<TMatrixDetailRequest[]>([]);

  const { data: existingMatrix } = useMatrixDetail(matrixId);

  const { mutate: createMatrix, isPending: creating } = useCreateMatrix();
  const { mutate: updateMatrix, isPending: updating } = useUpdateMatrix();
  const { mutate: createVersion, isPending: creatingVersion } = useCreateVersion();
  const { data: subjects } = useSubjectsList();

  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: "", code: "", description: "", duration: 60, totalScore: 10, subjectId: 0 },
  });

  const step2Form = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { versionName: "Version 1.0", versionNotes: "" },
  });

  const totalScore = step1Form.watch("totalScore");

  useEffect(() => {
    if (existingMatrix) {
      step1Form.reset({
        name: existingMatrix.name,
        code: existingMatrix.code,
        description: existingMatrix.description || "",
        duration: existingMatrix.duration,
        totalScore: existingMatrix.totalScore,
        subjectId: existingMatrix.subject?.id || 0,
      });
      setCreatedMatrixId(existingMatrix.id);
    }
  }, [existingMatrix, step1Form]);

  const handleStep1Submit = (values: Step1Values) => {
    if (isEdit && matrixId) {
      updateMatrix({ id: matrixId, data: values }, { onSuccess: () => navigate({ to: "/matrices" }) });
    } else {
      createMatrix(values, {
        onSuccess: (res) => {
          setCreatedMatrixId(res.data.data?.id);
          setStep(2);
        },
      });
    }
  };

  const handleStep2Submit = (values: Step2Values) => {
    if (!createdMatrixId) return;

    createVersion(
      {
        matrixId: createdMatrixId,
        name: values.versionName,
        notes: values.versionNotes,
        matrixDetails: matrixDetails.filter((d) => d.lessonId),
      },
      {
        onSuccess: () => navigate({ to: "/matrices" }),
      }
    );
  };

  const isPending = creating || updating || creatingVersion;

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4" onPress={() => navigate({ to: "/matrices" })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <h1 className="text-3xl font-bold mb-2">{isEdit ? "Chỉnh sửa ma trận" : `Tạo ma trận mới - Bước ${step}/2`}</h1>
        <p className="text-muted-foreground">
          {step === 1 ? "Thiết lập thông tin cơ bản" : "Cấu hình phân bổ câu hỏi"}
        </p>
      </div>

      {!isEdit && (
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s ? <Check className="h-5 w-5" /> : s}
              </div>
              <span className={`hidden sm:inline ${step === s ? "font-semibold" : ""}`}>
                {s === 1 ? "Thông tin" : "Cấu hình"}
              </span>
              {s < 2 && <div className="w-12 h-px bg-border" />}
            </div>
          ))}
        </div>
      )}

      {step === 1 && (
        <Form {...step1Form}>
          <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
                <CardDescription>Nhập thông tin chung về ma trận đề thi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={step1Form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tên ma trận <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="VD: Ma trận Toán lớp 10 - HK1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={step1Form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Mã ma trận <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="VD: MT-TOAN-10-HK1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={step1Form.control}
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Môn học <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        >
                          <option value="">-- Chọn môn học --</option>
                          {subjects?.map((s: any) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.code})
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={step1Form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thời gian (phút)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={step1Form.control}
                    name="totalScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tổng điểm</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={0.5}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={step1Form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Mô tả về ma trận..." rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onPress={() => navigate({ to: "/matrices" })}>
                Hủy
              </Button>
              <Button type="submit" isDisabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                {isEdit ? "Cập nhật" : "Tiếp theo"}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {step === 2 && (
        <Form {...step2Form}>
          <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin version</CardTitle>
                <CardDescription>Đặt tên và ghi chú cho version</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={step2Form.control}
                    name="versionName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tên version <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="VD: Version 1.0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={step2Form.control}
                    name="versionNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghi chú</FormLabel>
                        <FormControl>
                          <Input placeholder="Ghi chú..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cấu hình phân bổ câu hỏi</CardTitle>
                <CardDescription>Cấu hình số lượng câu hỏi theo độ khó</CardDescription>
              </CardHeader>
              <CardContent>
                <MatrixDetailTable value={matrixDetails} onChange={setMatrixDetails} targetTotalScore={totalScore} />
              </CardContent>
            </Card>

            <div className="flex justify-between gap-4">
              <Button type="button" variant="outline" onPress={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <Button type="submit" isDisabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Hoàn thành
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default CreateMatrixContent;
