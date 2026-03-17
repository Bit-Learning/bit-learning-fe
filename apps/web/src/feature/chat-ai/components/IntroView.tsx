import React from "react";
import { Bot, Code, Router, Repeat, Database } from "lucide-react";

interface IntroViewProps {
	onQuickQuestion: (question: string) => void;
}

const IntroView: React.FC<IntroViewProps> = ({ onQuickQuestion }) => {
	return (
		<div className="flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto w-full">
			{/* <div className="mb-8 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
        <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Bot size={40} />
        </div>
      </div> */}

			<h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-white">
				Bạn có câu hỏi nào về Tin học không?
			</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
				<button
					onClick={() =>
						onQuickQuestion("Cách sử dụng hàm lambda trong Python?")
					}
					className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left group"
				>
					<Code
						className="text-blue-500 group-hover:scale-110 transition-transform"
						size={24}
					/>
					<div>
						<p className="font-medium text-slate-700 dark:text-slate-200">
							Cách sử dụng hàm lambda trong Python?
						</p>
						<p className="text-xs text-slate-500">Lập trình Python</p>
					</div>
				</button>

				<button
					onClick={() => onQuickQuestion("Phân biệt giữa Switch và Router")}
					className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left group"
				>
					<Router
						className="text-orange-500 group-hover:scale-110 transition-transform"
						size={24}
					/>
					<div>
						<p className="font-medium text-slate-700 dark:text-slate-200">
							Phân biệt giữa Switch và Router
						</p>
						<p className="text-xs text-slate-500">Mạng máy tính</p>
					</div>
				</button>

				<button
					onClick={() => onQuickQuestion("Cấu trúc lệnh lặp trong Pascal")}
					className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left group"
				>
					<Repeat
						className="text-green-500 group-hover:scale-110 transition-transform"
						size={24}
					/>
					<div>
						<p className="font-medium text-slate-700 dark:text-slate-200">
							Cấu trúc lệnh lặp trong Pascal
						</p>
						<p className="text-xs text-slate-500">Ngôn ngữ Pascal</p>
					</div>
				</button>

				<button
					onClick={() => onQuickQuestion("Cách tối ưu hóa truy vấn SQL")}
					className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left group"
				>
					<Database
						className="text-purple-500 group-hover:scale-110 transition-transform"
						size={24}
					/>
					<div>
						<p className="font-medium text-slate-700 dark:text-slate-200">
							Cách tối ưu hóa truy vấn SQL
						</p>
						<p className="text-xs text-slate-500">Cơ sở dữ liệu</p>
					</div>
				</button>
			</div>
		</div>
	);
};

export default IntroView;
