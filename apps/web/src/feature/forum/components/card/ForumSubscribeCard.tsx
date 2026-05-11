import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";

export function ForumSubscribeCard({
	email,
	setEmail,
	onSubmit,
	isPending,
}: {
	email: string;
	setEmail: (value: string) => void;
	onSubmit: () => void;
	isPending: boolean;
}) {
	return (
		<section className="overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#0f6ab8_0%,#1a6eaf_52%,#135e9f_100%)] p-6 text-white shadow-sm">
			<div className="space-y-5">
				<div className="space-y-2">
					<p className="text-xs font-black uppercase tracking-[0.25em] text-blue-100/80">
						ĐĂNG KÝ NHẬN BÀI VIẾT MỚI
					</p>
					<p className="max-w-4xl text-base leading-8 text-blue-50">
						Nhận email khi cộng đồng Bit Learning có bài viết mới. Đăng ký để
						không bỏ lỡ các chủ đề Backend, Frontend, DevOps, AI và những chia
						sẻ hữu ích từ cộng đồng.
					</p>
				</div>

				<div className="flex flex-col gap-3 lg:flex-row">
					<Input
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						placeholder="Email"
						className="h-12 border-white/70 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-white focus-visible:ring-white/30"
					/>
					<Button
						type="button"
						onClick={onSubmit}
						isDisabled={isPending}
						className="h-12 min-w-44 rounded-xl border border-white/80 bg-transparent px-6 text-base font-semibold text-white hover:bg-white/10"
					>
						{isPending ? "Đang gửi..." : "Gửi yêu cầu"}
					</Button>
				</div>
			</div>
		</section>
	);
}
