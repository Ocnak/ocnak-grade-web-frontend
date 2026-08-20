"use client";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { otpSchema } from "./otp-schema";
import { useSearchParams } from "next/navigation";
import { Crimson_Text } from "next/font/google";
import { RippleButton } from "@/components/ui/ripple-button";
import { useRouter } from "next/navigation";
import { BetterAuthError } from "better-auth";
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { useSendVerificationOtp } from "@/hooks/use-auth";
import { REGEXP_ONLY_DIGITS } from "input-otp";

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

type formSchema = z.infer<typeof otpSchema>;

export default function VerifyOTPForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const { mutate: sendOtp, isPending: isResending } = useSendVerificationOtp();

  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<formSchema>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const onHandleResend = () => {
    if (!email || isResending) return;
    setError(null);
    sendOtp(email, {
      onSuccess: () => {
        reset();
        setTimeLeft(60);
      },
      onError: (err) => {
        setError(err.message ?? "Couldn't resend code. Try again.");
      },
    });
  };

  // const onSubmit = async (values: formSchema) => {
  //   try {
  //     setIsLoading(true);
  //     setError(null);
  //     if (!email) {
  //       setError("Email is missing");
  //       return;
  //     }
  //     const { data: session, error: verifyError } =
  //       await authClient.signIn.emailOtp({
  //         email,
  //         otp: values.otp,
  //       });
  //     if (verifyError) {
  //       setError(verifyError.message ?? "Verification failed");
  //       return;
  //     }
  //     let userRole = session?.user?.userRole;

  //     try {
  //       const roleRes = await fetch(
  //         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/role-by-email`,
  //         {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             email,
  //             authUserId: session?.user?.id,
  //           }),
  //         },
  //       );
  //       if (roleRes.ok) {
  //         const { user } = await roleRes.json();
  //         userRole = user?.userRole ?? userRole;

  //         const sessionFirstName = session?.user?.firstName;

  //         if (user?.firstName && user.firstName !== sessionFirstName) {
  //           await authClient.updateUser({
  //             firstName: user.firstName,
  //             lastName: user.lastName,
  //           });
  //         }
  //       }
  //     } catch (lookupErr) {
  //       console.error("Role/profile reconciliation failed:", lookupErr);
  //     }

  //     const pending = JSON.parse(
  //       sessionStorage.getItem("generalGradeSystem:pendingUser") ?? "{}",
  //     );
  //     if (pending.firstName) {
  //       const res = await fetch(
  //         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/create-admin`,
  //         {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             email,
  //             authUserId: session?.user?.id,
  //             ...pending,
  //           }),
  //         },
  //       );
  //       const data = await res.json();
  //       if (!res.ok) {
  //         setError(data.error ?? "Failed to create admin account");
  //         return;
  //       }
  //       userRole = data.user?.userRole ?? userRole;
  //       sessionStorage.removeItem("generalGradeSystem:pendingUser");
  //     }

  //     // Force a fresh DB read (bypassing the 20-min cookie cache) now that
  //     // all reconciliation writes are complete, then seed it directly
  //     // into the cache so AppHeader reflects it immediately
  //     const { data: freshSession } = await authClient.getSession({
  //       query: { disableCookieCache: true },
  //     });
  //     queryClient.setQueryData(["session"], freshSession ?? null);

  //     if (userRole === "teacher") {
  //       router.push("/teacher/students");
  //     } else if (userRole === "admin") {
  //       router.push("/admin-dashboard/teachers");
  //     } else {
  //       setError("Something went wrong. Please try again.");
  //     }
  //   } catch (error: unknown) {
  //     if (error instanceof BetterAuthError) {
  //       setError(error.message);
  //     } else {
  //       setError("Something went wrong");
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const onSubmit = async (values: formSchema) => {
    try {
      setIsLoading(true);
      setError(null);
      if (!email) {
        setError("Email is missing");
        return;
      }

      const { data: session, error: verifyError } =
        await authClient.signIn.emailOtp({
          email,
          otp: values.otp,
        });
      if (verifyError) {
        setError(verifyError.message ?? "Verification failed");
        return;
      }

      const pending = JSON.parse(
        sessionStorage.getItem("generalGradeSystem:pendingUser") ?? "{}",
      );

      let userRole = session?.user?.userRole;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/reconcile`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              authUserId: session?.user?.id,
              pendingAdmin: pending.firstName ? pending : undefined,
            }),
          },
        );

        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Failed to complete sign-in");
          return;
        }

        const { user } = await res.json();
        userRole = user.userRole;

        // Merge the reconciled fields directly into the session we already
        // have, and seed the cache — no extra getSession() DB round trip
        const mergedSession = session
          ? {
              ...session,
              user: {
                ...session.user,
                firstName: user.firstName,
                lastName: user.lastName,
                userRole: user.userRole,
              },
            }
          : null;
        queryClient.setQueryData(["session"], mergedSession);

        sessionStorage.removeItem("generalGradeSystem:pendingUser");
      } catch (reconcileErr) {
        console.error("Reconciliation failed:", reconcileErr);
        setError("Something went wrong. Please try again.");
        return;
      }

      if (userRole === "teacher") {
        router.push("/teacher/students");
      } else if (userRole === "admin") {
        router.push("/admin-dashboard/teachers");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (error: unknown) {
      if (error instanceof BetterAuthError) {
        setError(error.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="top-5 mt-20 w-full border-none px-4 md:mt-0 md:px-5 md:py-10">
        <h3
          className={`text-primary mt-5 mb-1 ${crimson_text.className} text-left text-3xl font-semibold text-[#444]`}
        >
          Please check your email
        </h3>

        <p className="text-left text-[14px] font-medium text-[#444]">
          We&apos;ve send a code to{" "}
          <span className="font-bold underline">{email}</span>
        </p>

        <form
          className="mx-1 mt-5 space-y-2 md:space-y-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Field data-invalid={!!errors.otp} className="text-left">
            <FieldLabel className="text-[13px]">OTP Code</FieldLabel>
            <Controller
              name="otp"
              control={control}
              render={({ field }) => (
                <InputOTP
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={6}
                  onComplete={(value) => field.onChange(value)}
                  pattern={REGEXP_ONLY_DIGITS}
                >
                  {/* <InputOTPGroup className="w-full gap-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="h-12 min-w-0 flex-1 rounded-[7px]! border-none bg-neutral-200 text-sm"
                      />
                    ))}
                  </InputOTPGroup> */}

                  <InputOTPGroup className="w-[50%] ">
                    {[0, 1, 2].map((i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="h-12 min-w-0 flex-1 text-sm border border-gray-300"
                      />
                    ))}
                  </InputOTPGroup>

                  <div role="separator" className="text-muted-foreground mx-3">
                    <span className="bg-muted-foreground block h-1 w-1 rounded-full"></span>
                  </div>

                  <InputOTPGroup className="w-[50%] ">
                    {[3, 4, 5].map((i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="h-12 min-w-0 flex-1 text-sm border border-gray-300"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
            {errors.otp && <FieldError>{errors.otp.message}</FieldError>}
          </Field>

          <p className="text-muted-foreground text-[13px]">
            {timeLeft > 0 ? (
              `Resend available in ${formatTime(timeLeft)}`
            ) : (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onHandleResend();
                }}
                aria-disabled={isResending}
                className={` ${isResending ? "pointer-events-none opacity-50" : ""}`}
              >
                Didn't get the code?{" "}
                <span className="hover:text-primary underline">
                  Resend code
                </span>
              </a>
            )}
          </p>

          {error && (
            <div className="rounded border-l-4 border-red-700 bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-[12px] font-medium tracking-wide text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 flex w-full justify-end">
            <RippleButton
              type="submit"
              disabled={isLoading}
              className="bg-primary flex h-11 w-32 cursor-pointer items-center justify-center gap-2 rounded text-[12px] text-white"
            >
              {isLoading ? (
                <Loader size={23} className="animate-spin" />
              ) : (
                <span>Submit</span>
              )}
            </RippleButton>
          </div>

          {/* <p className="md:text-center text-[12px]">
              Don&apos;t have an account{" "}
              <Link
                href="/"
                className="text-primary cursor-pointer font-bold transition-all duration-300 hover:underline"
              >
                Sign up
              </Link>
            </p> */}
        </form>
      </div>
    </>
  );
}
