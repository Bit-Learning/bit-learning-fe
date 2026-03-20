import type React from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthLayout } from "../auth-layout";
import { SignUpForm } from "../components/sign-up-form";

const SignUp: React.FC = () => {
  return (
    <AuthLayout>
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight text-slate-800">Tạo tài khoản</CardTitle>
          <CardDescription>
            Nhập email và mật khẩu để tạo tài khoản mới. <br />
            Đã có tài khoản?{" "}
            <Link to="/sign-in" className="font-semibold text-blue-600 underline-offset-4 hover:underline">
              Đăng nhập
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground px-8 text-center text-sm">
            Bằng cách tạo tài khoản, bạn đồng ý với{" "}
            <a href="/terms" className="underline underline-offset-4 hover:text-blue-600">
              Điều khoản dịch vụ
            </a>{" "}
            và{" "}
            <a href="/privacy" className="underline underline-offset-4 hover:text-blue-600">
              Chính sách bảo mật
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
};

export default SignUp;
