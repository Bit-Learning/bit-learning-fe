import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn, Shield, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { useLogin } from "../queries/useAuth";
import type { TAdminLoginRequest } from "../types/auth.types";

const formSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu").min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  role: z.enum(["ADMIN", "MANAGER"]),
});

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string;
}

export const UserAuthForm: React.FC<UserAuthFormProps> = ({ className, redirectTo, ...props }) => {
  const { mutate: login, isPending: isLoading } = useLogin({
    redirectTo,
    on2FARequired: (email: string) => {
      toast.info(`Yêu cầu xác thực 2 bước cho ${email}`);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", role: "ADMIN" },
  });

  const selectedRole = form.watch("role");

  function onSubmit(data: z.infer<typeof formSchema>) {
    login({
      email: data.email,
      password: data.password,
      role: data.role,
    } as TAdminLoginRequest);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("grid gap-5", className)} {...props}>
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-slate-600">Vai trò đăng nhập</FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => field.onChange("ADMIN")}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all duration-200",
                      field.value === "ADMIN"
                        ? "border-blue-600 bg-blue-600 text-white shadow-md"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50",
                    )}
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange("MANAGER")}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all duration-200",
                      field.value === "MANAGER"
                        ? "border-orange-500 bg-orange-500 text-white shadow-md"
                        : "border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50",
                    )}
                  >
                    <Users className="h-4 w-4" />
                    Quản lý (Manager)
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-slate-600">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="ten@example.com"
                  className={cn(
                    "h-11 rounded-lg border-2 transition-all duration-200",
                    selectedRole === "ADMIN"
                      ? "focus:border-blue-500 focus:ring-blue-100"
                      : "focus:border-orange-500 focus:ring-orange-100",
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-slate-600">Mật khẩu</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="••••••••"
                  className={cn(
                    "h-11 rounded-lg border-2 transition-all duration-200",
                    selectedRole === "ADMIN"
                      ? "focus:border-blue-500 focus:ring-blue-100"
                      : "focus:border-orange-500 focus:ring-orange-100",
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          size="lg"
          className={cn(
            "mt-1 h-11 w-full rounded-lg font-semibold text-white transition-all duration-200",
            selectedRole === "ADMIN" ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-500 hover:bg-orange-600",
          )}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          Đăng nhập
        </Button>
      </form>
    </Form>
  );
};
