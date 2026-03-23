import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { showSubmittedData } from "@/shared/lib/show-submitted-data";
import { cn } from "@/shared/lib/utils";

const formSchema = z.object({
  otp: z.string().min(6, "Vui lòng nhập đủ 6 chữ số.").max(6, "Vui lòng nhập đủ 6 chữ số."),
});

type OtpFormProps = React.HTMLAttributes<HTMLFormElement>;

export function OtpForm({ className, ...props }: OtpFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: "" },
  });

  const otp = form.watch("otp");

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    showSubmittedData(data);

    setTimeout(() => {
      setIsLoading(false);
      navigate({ to: "/" });
    }, 1000);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("grid gap-4", className)} {...props}>
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Mã xác thực</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  {...field}
                  containerClassName='justify-between sm:[&>[data-slot="input-otp-group"]>div]:w-12'
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="border-slate-200 focus:border-blue-500" />
                    <InputOTPSlot index={1} className="border-slate-200 focus:border-blue-500" />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={2} className="border-slate-200 focus:border-blue-500" />
                    <InputOTPSlot index={3} className="border-slate-200 focus:border-blue-500" />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={4} className="border-slate-200 focus:border-blue-500" />
                    <InputOTPSlot index={5} className="border-slate-200 focus:border-blue-500" />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="mt-1 h-11 w-full rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700"
          disabled={otp.length < 6 || isLoading}
        >
          Xác nhận
        </Button>
      </form>
    </Form>
  );
}
