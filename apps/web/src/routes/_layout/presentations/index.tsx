import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import PresentationList from "@/feature/presentations/pages/PresentationList";
import PresentationBanner from "@/shared/components/PresentationBanner";

const fadeInUp = {
	hidden: { opacity: 0, y: 40 },
	visible: { opacity: 1, y: 0 },
};

export const Route = createFileRoute("/_layout/presentations/")({
	component: PresentationRoute,
});

function PresentationRoute() {
	const _navigate = useNavigate();

	return (
		// === PAGE LOAD ANIMATION ===
		<motion.div
			className="flex min-h-screen flex-col"
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8, ease: "easeOut" }}
		>
			{/* === MAIN CONTENT (SCROLL ANIMATED SECTIONS) === */}
			<main className="flex-1 overflow-hidden bg-[#FFFFFF]">
				<motion.div
					variants={fadeInUp}
					initial="hidden"
					whileInView="visible"
					transition={{ duration: 0.6 }}
					viewport={{ once: true, amount: 0.3 }}
				>
					<PresentationBanner />
				</motion.div>

				<motion.div
					variants={fadeInUp}
					initial="hidden"
					whileInView="visible"
					transition={{ duration: 0.6, delay: 0.2 }}
					viewport={{ once: true, amount: 0.3 }}
				>
					{/* <ProductGrid title="Slide Template" badgeText="Chuyên đề giáo dục" viewMoreLink="hehe" /> */}

					<PresentationList />
				</motion.div>

				<motion.div
					variants={fadeInUp}
					initial="hidden"
					whileInView="visible"
					transition={{ duration: 0.6, delay: 0.2 }}
					viewport={{ once: true, amount: 0.3 }}
				>
					<section className="bg-gradient-to-r from-orange-400 to-red-400 py-16">
						<div className="container mx-auto px-4">
							<div className="grid gap-8 text-center text-white md:grid-cols-3">
								<div className="space-y-2">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										className="lucide lucide-users mx-auto mb-4 h-12 w-12"
										aria-hidden="true"
									>
										<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
										<path d="M16 3.128a4 4 0 0 1 0 7.744" />
										<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
										<circle cx="9" cy="7" r="4" />
									</svg>
									<div className="text-4xl font-bold">10,000+</div>
									<div className="text-orange-100">Học viên</div>
								</div>
								<div className="space-y-2">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										className="lucide lucide-book-open mx-auto mb-4 h-12 w-12"
										aria-hidden="true"
									>
										<path d="M12 7v14" />
										<path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
									</svg>
									<div className="text-4xl font-bold">50+</div>
									<div className="text-orange-100">Khóa học</div>
								</div>
								<div className="space-y-2">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										className="lucide lucide-award mx-auto mb-4 h-12 w-12"
										aria-hidden="true"
									>
										<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
										<circle cx="12" cy="8" r="6" />
									</svg>
									<div className="text-4xl font-bold">98%</div>
									<div className="text-orange-100">Hài lòng</div>
								</div>
							</div>
						</div>
					</section>
					<section className="bg-white py-16">
						<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
							<div className="mb-12 text-center">
								<h2 className="mb-4 text-3xl font-bold text-gray-900">
									Bạn cần được giúp đỡ?
								</h2>
							</div>
							<div className="grid items-center gap-8 lg:grid-cols-2">
								<div className="hidden items-center justify-center md:flex">
									<img src="/robot.png" width="400" height="400" />
								</div>
								<div
									data-slot="card"
									className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm"
								>
									<div
										data-slot="card-header"
										className="@container/card-header has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6"
									>
										<div
											data-slot="card-title"
											className="font-semibold leading-none"
										>
											Liên hệ với chúng tôi
										</div>
									</div>
									<div data-slot="card-content" className="px-6">
										<form className="space-y-4">
											<div>
												<input
													type="email"
													data-slot="input"
													className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base outline-none transition-[color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
													placeholder="Email của bạn"
													required
													name="email"
													value=""
												/>
											</div>
											<div>
												<input
													type="tel"
													data-slot="input"
													className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base outline-none transition-[color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
													placeholder="Số điện thoại"
													required
													name="phone"
													value=""
												/>
											</div>
											<div>
												<textarea
													data-slot="textarea"
													className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 field-sizing-content shadow-xs flex min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
													name="message"
													placeholder="Nội dung cần tư vấn"
													rows={4}
													required
												/>
											</div>
											<button
												data-slot="button"
												className="[&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs has-[&gt;svg]:px-4 mt-2 inline-flex h-10 w-full shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#FB6E19] px-6 text-sm font-medium text-white outline-none transition-all hover:bg-[#e55a0f] focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
												type="submit"
											>
												Gửi yêu cầu
											</button>
										</form>
									</div>
								</div>
							</div>
						</div>
					</section>
				</motion.div>
			</main>
			{/* Footer */}
		</motion.div>
	);
}
