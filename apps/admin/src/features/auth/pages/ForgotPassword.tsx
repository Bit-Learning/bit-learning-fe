import type React from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthLayout } from "../auth-layout";
import { ForgotPasswordForm } from "../components/forgot-password-form";

const ForgotPassword: React.FC = () => {
  return (
    <AuthLayout>
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight text-slate-800">Quên mật khẩu</CardTitle>
          <CardDescription>
            Nhập email đã đăng ký và chúng tôi sẽ gửi <br />
            liên kết đặt lại mật khẩu cho bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground mx-auto px-8 text-center text-sm text-balance">
            Nhớ mật khẩu rồi?{" "}
            <Link to="/sign-in" className="font-semibold text-blue-600 underline-offset-4 hover:underline">
              Đăng nhập
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
};

export default ForgotPassword;
