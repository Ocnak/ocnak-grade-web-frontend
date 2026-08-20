"use client";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { loginSchema } from "./loginSchema";
import { Fredoka } from "next/font/google";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { RippleButton } from "@/components/ui/ripple-button";
import { useSendVerificationOtp } from "@/hooks/use-auth";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

type formSchema = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { mutate: sendOtp, isPending } = useSendVerificationOtp();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: formSchema) => {
    try {
      setError(null);
      setIsLoading(true);
      // Check if email exists before sending OTP
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/check-email?email=${encodeURIComponent(values.email)}`,
      );

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const { exists } = await res.json();

      if (!exists) {
        setError("No account found with this email. Kindly sign up first.");
        return;
      }

      // Send OTP only if user exists
      sendOtp(values.email, {
        onSuccess: () => {
          router.push(
            `/auth/verify-otp?email=${encodeURIComponent(values.email)}`,
          );
        },
        onError: (err) => {
          setError(err.message);
        },
      });
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="top-5 mt-20 w-full items-center justify-center border-none px-4 md:mt-0 md:px-5 md:py-10">
        <h3
          className={`text-primary mt-5 mb-1 ${fredoka.className} text-left text-[30px] font-semibold text-[#444]`}
        >
          Login Form
        </h3>

        <p className="text-left text-[15px] font-medium text-[#444]">
          Login to your account
        </p>

        <form
          className="mx-1 mt-5 mb-0 space-y-2 md:space-y-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Email Field */}
          <Field data-invalid={!!errors.email}>
            <FieldLabel className="text-[12px] font-bold text-[#777]">
              Email Address
            </FieldLabel>
            <Input
              placeholder="example@gmail.com"
              className="h-11 rounded bg-white"
              {...register("email")}
            />
            {errors.email && (
              <FieldError className="text-red-700">
                {errors.email.message}
              </FieldError>
            )}
          </Field>

          {error && (
            <div className="rounded border-l-4 border-red-700 bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-[13px] font-medium tracking-wide text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex w-full justify-end">
            <RippleButton
              type="submit"
              disabled={isLoading}
              className="bg-slate-800 flex h-11.5 w-32 cursor-pointer items-center justify-center gap-2 rounded-md text-[12px] text-white"
            >
              {isLoading ? (
                <Loader size={23} className="animate-spin" />
              ) : (
                <span>Submit</span>
              )}
            </RippleButton>
          </div>

          {pathname === "/auth/login" ? (
            <div></div>
          ) : (
            <p className="text-[12px] tracking-wide text-[#666] md:text-center">
              Don&apos;t have an account{" "}
              <Link
                href="/auth/admin-register"
                className="cursor-pointer font-bold underline"
              >
                Sign up
              </Link>
            </p>
          )}
        </form>
      </div>
    </>
  );
}
