import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { setAuthTokens } from "@/shared/lib/cookies";
import { cn } from "@/shared/lib/utils";
// import { IconFacebook, IconGithub } from '@/assets/brand-icons'
import { useAuthStore } from "@/shared/stores/auth-store";
import { TAdminLoginRequest } from "../types/auth.types";
import { AdminLogin } from "../api/auth.api";

const formSchema = z.object({
  email: z.string().min(1, "Please enter your email").email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password").min(6, "Password must be at least 6 characters long"),
});

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string;
}

export function UserAuthForm({ className, redirectTo, ...props }: UserAuthFormProps) {
  const navigate = useNavigate();
  const { auth } = useAuthStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // TanStack Query mutation for login
  const loginMutation = useMutation({
    mutationFn: (data: TAdminLoginRequest) => AdminLogin(data),
    onSuccess: (response) => {
      const { accessToken, refreshToken, user } = response.data.data;

      // Verify user has ADMIN or STAFF role
      if (user.role !== "ADMIN" && user.role !== "STAFF") {
        toast.error("Access denied. Only administrators can access this panel.");
        return;
      }

      // Set tokens in cookies using the helper function
      setAuthTokens(accessToken, refreshToken);

      // Update store state
      auth.setAccessToken(accessToken);
      auth.setRefreshToken(refreshToken);
      auth.setUser({
        accountNo: user.id.toString(),
        email: user.email,
        role: [user.role],
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      });

      toast.success(`Welcome back, ${user.firstName}!`);

      // Redirect to the stored location or default to dashboard
      const targetPath = redirectTo || "/";
      navigate({ to: targetPath, replace: true });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Login failed. Please check your credentials.";

      // Handle specific error cases
      if (error?.response?.status === 401) {
        if (errorMessage.toLowerCase().includes("not activated")) {
          toast.error("Your account is not activated. Please check your email.");
        } else if (errorMessage.toLowerCase().includes("invalid credentials")) {
          toast.error("Invalid email or password.");
        } else {
          toast.error("Access denied. Only administrators can access this panel.");
        }
      } else {
        toast.error(errorMessage);
      }
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
      role: "ADMIN", // Always use ADMIN role for admin panel
    });
  }

  // Mock account for quick login (development only)
  const fillMockAccount = () => {
    form.setValue("email", "admin@gmail.com");
    form.setValue("password", "123456");
    toast.info("Mock admin credentials filled");
  };

  // Bypass login - fake authentication (development only)
  const bypassLogin = () => {
    // Create fake tokens
    const fakeAccessToken = `fake-access-token-${Date.now()}`;
    const fakeRefreshToken = `fake-refresh-token-${Date.now()}`;

    // Set fake tokens in cookies
    setAuthTokens(fakeAccessToken, fakeRefreshToken);

    // Set fake user data in store
    auth.setAccessToken(fakeAccessToken);
    auth.setRefreshToken(fakeRefreshToken);
    auth.setUser({
      accountNo: "1",
      email: "admin@example.com",
      role: ["ADMIN"],
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      firstName: "Admin",
      lastName: "User",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
    });

    toast.success("🚀 Bypassed login - Welcome Admin!");

    // Redirect to dashboard
    const targetPath = redirectTo || "/";
    navigate({ to: targetPath, replace: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("grid gap-5 px-2", className)} {...props}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#aaa]">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="name@gmail.com"
                  className="border-[#0f0]/30 bg-[#333] text-white placeholder:text-gray-500 focus:border-[#0f0] focus:ring-[#0f0]"
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
            <FormItem className="relative">
              <FormLabel className="text-[#aaa]">Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="********"
                  className="border-[#0f0]/30 bg-[#333] text-white placeholder:text-gray-500 focus:border-[#0f0] focus:ring-[#0f0]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              {/* <Link
                to='/forgot-password'
                className='absolute end-0 -top-0.5 text-sm font-medium text-white hover:opacity-75'
              >
                Forgot password?
              </Link> */}
            </FormItem>
          )}
        />
        <Button
          size={"lg"}
          className="mt-2 bg-[#0f0] text-black hover:bg-[#00ff00]/80"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? <Loader2 className="animate-spin" /> : <LogIn />}
          Sign in
        </Button>

        {/* Development: Quick login with mock account */}
        {import.meta.env.DEV && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillMockAccount}
              className="border-[#0f0]/30 text-[#0f0] hover:bg-[#0f0]/10 hover:text-[#0f0]"
              disabled={loginMutation.isPending}
            >
              � Fill Mock
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={bypassLogin}
              className="border-[#0f0]/50 bg-[#0f0]/10 text-[#0f0] hover:bg-[#0f0]/20 hover:text-[#0f0]"
              disabled={loginMutation.isPending}
            >
              🚀 Bypass Login
            </Button>
          </div>
        )}

        {/* <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background text-muted-foreground px-2'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button
            variant='outline'
            type='button'
            disabled={loginMutation.isPending}
          >
            <IconGithub className='h-4 w-4' /> GitHub
          </Button>
          <Button
            variant='outline'
            type='button'
            disabled={loginMutation.isPending}
          >
            <IconFacebook className='h-4 w-4' /> Facebook
          </Button>
        </div> */}
      </form>
    </Form>
  );
}
