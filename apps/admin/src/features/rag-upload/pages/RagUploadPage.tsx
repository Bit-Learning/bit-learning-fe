import { useState } from "react";
import {
	UploadIcon,
	FileTextIcon,
	CheckCircleIcon,
	XCircleIcon,
	ClockIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useUploadTextbook, useRagUploads } from "../queries/useRagUpload";
import { Header } from "@/layout/header";

export const RagUploadPage = () => {
	const [file, setFile] = useState<File | null>(null);
	const [bookName, setBookName] = useState("");
	const [publisher, setPublisher] = useState("");
	const [grade, setGrade] = useState("");
	const [productName, setProductName] = useState("");

	const uploadMutation = useUploadTextbook();
	const { data: uploads = [], isLoading } = useRagUploads();

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			if (selectedFile.type !== "application/pdf") {
				alert("Chỉ chấp nhận file PDF");
				return;
			}
			setFile(selectedFile);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!file || !bookName || !publisher) {
			alert("Vui lòng điền đầy đủ thông tin bắt buộc");
			return;
		}

		uploadMutation.mutate(
			{ file, bookName, publisher, grade, productName },
			{
				onSuccess: () => {
					setFile(null);
					setBookName("");
					setPublisher("");
					setGrade("");
					setProductName("");
					const fileInput = document.getElementById(
						"file-upload",
					) as HTMLInputElement;
					if (fileInput) fileInput.value = "";
				},
			},
		);
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return (
					<Badge variant="default" className="gap-1">
						<CheckCircleIcon className="h-3 w-3" />
						Hoàn thành
					</Badge>
				);
			case "PROCESSING":
				return (
					<Badge variant="secondary" className="gap-1">
						<ClockIcon className="h-3 w-3" />
						Đang xử lý
					</Badge>
				);
			case "FAILED":
				return (
					<Badge variant="destructive" className="gap-1">
						<XCircleIcon className="h-3 w-3" />
						Thất bại
					</Badge>
				);
			default:
				return (
					<Badge variant="outline" className="gap-1">
						<ClockIcon className="h-3 w-3" />
						Chờ xử lý
					</Badge>
				);
		}
	};

	return (
		<>
			<Header />
			<div className="space-y-6 p-6">
				<div>
					<h1 className="text-2xl font-bold">Upload Tài liệu RAG</h1>
					<p className="text-muted-foreground mt-1 text-sm">
						Tải lên sách giáo khoa PDF để bổ sung vào hệ thống RAG
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Tải lên tài liệu mới</CardTitle>
						<CardDescription>
							Chỉ chấp nhận file PDF. Hệ thống sẽ tự động trích xuất nội dung và
							lưu vào vector store.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="file-upload">
										File PDF <span className="text-destructive">*</span>
									</Label>
									<div className="flex items-center gap-2">
										<Input
											id="file-upload"
											type="file"
											accept=".pdf"
											onChange={handleFileChange}
											disabled={uploadMutation.isPending}
										/>
										{file && (
											<FileTextIcon className="text-muted-foreground h-5 w-5" />
										)}
									</div>
									{file && (
										<p className="text-muted-foreground text-xs">
											Đã chọn: {file.name} (
											{(file.size / 1024 / 1024).toFixed(2)} MB)
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="book-name">
										Tên sách <span className="text-destructive">*</span>
									</Label>
									<Input
										id="book-name"
										placeholder="VD: Tin học 10"
										value={bookName}
										onChange={(e) => setBookName(e.target.value)}
										disabled={uploadMutation.isPending}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="publisher">
										Nhà xuất bản <span className="text-destructive">*</span>
									</Label>
									<Input
										id="publisher"
										placeholder="VD: NXB Giáo dục Việt Nam"
										value={publisher}
										onChange={(e) => setPublisher(e.target.value)}
										disabled={uploadMutation.isPending}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="grade">Lớp</Label>
									<Input
										id="grade"
										placeholder="VD: 10"
										value={grade}
										onChange={(e) => setGrade(e.target.value)}
										disabled={uploadMutation.isPending}
									/>
								</div>

								<div className="space-y-2 md:col-span-2">
									<Label htmlFor="product-name">Tên sản phẩm</Label>
									<Input
										id="product-name"
										placeholder="VD: Tin học THPT"
										value={productName}
										onChange={(e) => setProductName(e.target.value)}
										disabled={uploadMutation.isPending}
									/>
								</div>
							</div>

							<Button
								type="submit"
								disabled={
									uploadMutation.isPending || !file || !bookName || !publisher
								}
							>
								<UploadIcon className="mr-2 h-4 w-4" />
								{uploadMutation.isPending ? "Đang tải lên..." : "Tải lên"}
							</Button>
						</form>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Lịch sử tải lên</CardTitle>
						<CardDescription>Danh sách các tài liệu đã tải lên</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="rounded-lg border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Tên sách</TableHead>
										<TableHead>Nhà xuất bản</TableHead>
										<TableHead>Lớp</TableHead>
										<TableHead>Trạng thái</TableHead>
										<TableHead>Ngày tải lên</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{isLoading ? (
										Array.from({ length: 3 }).map((_, i) => (
											<TableRow key={i}>
												{Array.from({ length: 5 }).map((_, j) => (
													<TableCell key={j}>
														<Skeleton className="h-4 w-full" />
													</TableCell>
												))}
											</TableRow>
										))
									) : uploads.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={5}
												className="text-muted-foreground py-10 text-center text-sm"
											>
												Chưa có tài liệu nào được tải lên
											</TableCell>
										</TableRow>
									) : (
										uploads.map((upload) => (
											<TableRow key={upload.id}>
												<TableCell className="font-medium">
													{upload.bookName}
												</TableCell>
												<TableCell>{upload.publisher}</TableCell>
												<TableCell>{upload.grade || "—"}</TableCell>
												<TableCell>{getStatusBadge(upload.status)}</TableCell>
												<TableCell className="text-muted-foreground text-sm">
													{new Date(upload.createdAt).toLocaleString("vi-VN")}
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	);
};
