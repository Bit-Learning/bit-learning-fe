import type React from "react";
import { cn } from "@/shared/lib/utils";
import dashboardDark from "@/shared/assets/dashboard-dark.png";
import dashboardLight from "@/shared/assets/dashboard-light.png";
import { UserAuthForm } from "../components/user-auth-form";

const SignIn: React.FC = () => {
  return (
    <div className="container relative grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="flex h-full flex-col items-center justify-center bg-white px-6 lg:p-8">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="space-y-1 text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg">
                B
              </div>
              <span className="text-xl font-bold text-slate-800">Bit Learning</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Cổng quản trị</h2>
            <p className="text-sm text-slate-500">Đăng nhập để truy cập bảng điều khiển quản trị</p>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <p className="text-xs text-slate-500">
              Chỉ dành cho <span className="font-semibold text-blue-600">Quản trị viên</span> và{" "}
              <span className="font-semibold text-orange-500">Nhà quản lý</span>
            </p>
          </div>

          <UserAuthForm />

          <p className="text-center text-xs text-slate-400">
            Bằng cách đăng nhập, bạn đồng ý với{" "}
            <a href="/terms" className="underline underline-offset-2 hover:text-blue-600">
              Điều khoản dịch vụ
            </a>{" "}
            và{" "}
            <a href="/privacy" className="underline underline-offset-2 hover:text-blue-600">
              Chính sách bảo mật
            </a>
            .
          </p>
        </div>
      </div>

      <div
        className={cn(
          "bg-slate-100 relative h-full overflow-hidden max-lg:hidden",
          "[&>img]:absolute [&>img]:top-[15%] [&>img]:left-20 [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>img]:object-top-left [&>img]:select-none",
        )}
      >
        <div className="absolute inset-0 z-10 bg-blue-600/5" />
        <div className="absolute bottom-0 left-0 right-0 z-10 h-32 bg-white/10 backdrop-blur-sm" />
        <div className="absolute top-8 left-8 z-20 space-y-1">
          <div className="h-1 w-12 rounded-full bg-blue-600" />
          <div className="h-1 w-8 rounded-full bg-orange-500" />
        </div>
        <img src={dashboardLight} className="dark:hidden" width={1024} height={1151} alt="Dashboard" />
        <img src={dashboardDark} className="hidden dark:block" width={1024} height={1138} alt="Dashboard" />
      </div>
    </div>
  );
};

export default SignIn;
