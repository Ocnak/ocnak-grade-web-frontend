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
import { Fredoka } from "next/font/google";
import { RippleButton } from "@/components/ui/ripple-button";
import { useRouter } from "next/navigation";
import { BetterAuthError } from "better-auth";
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { useSendVerificationOtp } from "@/hooks/use-auth";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Spinner } from "@/components/ui/spinner";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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

  //     const pending = JSON.parse(
  //       sessionStorage.getItem("ocnakLiberiaGradeSystem:pendingUser") ?? "{}",
  //     );

  //     let userRole = session?.user?.userRole;

  //     try {
  //       const res = await fetch(
  //         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/reconcile`,
  //         {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           credentials: "include",
  //           body: JSON.stringify({
  //             email,
  //             authUserId: session?.user?.id,
  //             pendingAdmin: pending.firstName ? pending : undefined,
  //           }),
  //         },
  //       );

  //       if (!res.ok) {
  //         const data = await res.json();
  //         setError(data.error ?? "Failed to complete sign-in");
  //         return;
  //       }

  //       const { user } = await res.json();
  //       userRole = user.userRole;

  //       // reconcile just updated the DB out from under the session that was
  //       // issued in signIn.emailOtp() above — that session's cookieCache
  //       // snapshot is now stale, so force Better Auth to bypass it and
  //       // read the DB fresh, rather than trusting a client-side merge
  //       const { data: freshSession } = await authClient.getSession({
  //         query: { disableCookieCache: true },
  //       });

  //       const mergedSession = freshSession ?? session;
  //       userRole = mergedSession?.user?.userRole ?? userRole;

  //       queryClient.setQueryData(["session"], mergedSession);
  //       await queryClient.invalidateQueries({ queryKey: ["session"] });
  //       sessionStorage.removeItem("ocnakLiberiaGradeSystem:pendingUser");
  //     } catch (reconcileErr) {
  //       console.error("Reconciliation failed:", reconcileErr);
  //       setError("Something went wrong. Please try again.");
  //       return;
  //     }

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
        sessionStorage.getItem("ocnakLiberiaGradeSystem:pendingUser") ?? "{}",
      );

      let userRole = session?.user?.userRole;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/reconcile`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
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
        // reconcile just wrote this role to the DB — it's the source of
        // truth for this redirect decision, don't let anything below
        // silently overwrite it with a stale value
        userRole = user.userRole;

        // reconcile just updated the DB out from under the session that was
        // issued in signIn.emailOtp() above — that session's cookieCache
        // snapshot is now stale, so force Better Auth to bypass it and
        // read the DB fresh, rather than trusting a client-side merge
        const { data: freshSession } = await authClient.getSession({
          query: { disableCookieCache: true },
        });

        const mergedSession = freshSession ?? session;

        // getSession() can still lag behind the write we just made in
        // reconcile (secondary session store / replication delay), so
        // patch the role onto the cached session object instead of
        // trusting whatever getSession() returned for it
        const patchedSession = mergedSession
          ? {
              ...mergedSession,
              user: { ...mergedSession.user, userRole: userRole },
            }
          : mergedSession;

        queryClient.setQueryData(["session"], patchedSession);
        await queryClient.invalidateQueries({ queryKey: ["session"] });
        sessionStorage.removeItem("ocnakLiberiaGradeSystem:pendingUser");
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
          className={`text-primary mt-5 mb-1 ${fredoka.className} text-left text-3xl font-semibold text-[#444]`}
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
                    <span className="bg-muted-foreground bg-slate-800 block h-1 w-1 rounded-full"></span>
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
              className="bg-slate-800 flex h-11.5 w-32 cursor-pointer items-center justify-center gap-2 rounded-md text-[12px] text-white"
            >
              {isLoading ? <Spinner className="size-7" /> : <span>Submit</span>}
            </RippleButton>
          </div>
        </form>
      </div>
    </>
  );
}
