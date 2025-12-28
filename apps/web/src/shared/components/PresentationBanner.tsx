export default function SlideBanner() {
    return (
        <section className="relative overflow-hidden bg-[#F5FAFF]">
            <section className="relative h-[550px] overflow-hidden bg-gradient-to-r from-orange-100 via-orange-50 to-amber-100">
                <div className="absolute inset-0">
                    <div className="animate-bounce-slow absolute left-10 top-20 h-32 w-32 rounded-full bg-orange-200/30"></div>
                    <div className="absolute right-20 top-40 h-24 w-24 animate-pulse rounded-full bg-amber-200/40"></div>
                    <div className="animate-bounce-slow absolute bottom-20 left-1/4 h-16 w-16 rounded-full bg-orange-300/20 delay-1000"></div>
                    <svg
                        className="absolute bottom-0 left-0 h-32 w-full"
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z"
                            fill="rgba(251, 146, 60, 0.1)"
                            className="animate-wave"
                        ></path>
                    </svg>
                    <svg
                        className="absolute bottom-0 left-0 h-24 w-full"
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M0,80 C400,20 800,100 1200,40 L1200,120 L0,120 Z"
                            fill="rgba(245, 158, 11, 0.15)"
                            className="animate-wave-reverse"
                        ></path>
                    </svg>
                    <div className="animate-spin-slow absolute right-1/4 top-32 h-8 w-8 rotate-45 bg-orange-300/30"></div>
                    <div className="absolute bottom-32 right-10 h-12 w-12 rotate-12 animate-pulse border-2 border-orange-400/40"></div>
                </div>
                <div className="container relative mx-auto px-8 py-10">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500 bg-orange-100 px-2 py-2 text-sm font-medium text-orange-700">
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
                                        className="lucide lucide-award h-4 w-4"
                                        aria-hidden="true"
                                    >
                                        <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path>
                                        <circle cx="12" cy="8" r="6"></circle>
                                    </svg>
                                    Nền tảng giáo dục hàng đầu
                                </div>
                                <h1 className="text-3xl font-bold leading-tight text-gray-800 lg:text-6xl">
                                    <span className="relative text-orange-500">
                                        Bithub Game Center
                                        <svg className="absolute -bottom-2 left-0 h-3 w-full" viewBox="0 0 200 12">
                                            <path
                                                d="M0,8 Q50,2 100,8 T200,8"
                                                stroke="currentColor"
                                                stroke-width="3"
                                                fill="none"
                                                className="animate-draw"
                                            ></path>
                                        </svg>
                                    </span>
                                </h1>
                                <h3 className="text-xl font-bold leading-tight text-gray-800 lg:text-4xl">
                                    Trí tuệ nhân tạo - Giáo dục sáng tạo
                                </h3>
                                <p className="max-w-xl text-xl leading-relaxed text-gray-600">
                                    Thử thách bản thân với các trò chơi tương tác. Kiểm tra kiến ​​thức, nâng cao kỹ
                                    năng và cạnh tranh với những người chơi khác!
                                </p>
                            </div>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <button
                                    data-slot="button"
                                    className="[&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs has-[&gt;svg]:px-4 group inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-orange-500 px-10 py-6 text-lg font-medium text-white outline-none transition-all hover:bg-orange-600 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                                >
                                    Bắt đầu chơi ngay
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
                                        className="lucide lucide-arrow-right ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                                        aria-hidden="true"
                                    >
                                        <path d="M5 12h14"></path>
                                        <path d="m12 5 7 7-7 7"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="relative hidden items-center justify-center md:flex">
                            <img src="robot.png" alt="Landing Banner" className="w-115 h-115" />
                        </div>
                    </div>
                </div>
            </section>
        </section>
    )
}
