"use client";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { adminSignupFormSchema } from "./adminSignupFormSchema";
import { Crimson_Text, Fredoka } from "next/font/google";
import { RippleButton } from "@/components/ui/ripple-button";
import { useSendVerificationOtp } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

type formSchema = z.infer<typeof adminSignupFormSchema>;

export default function AdminSignupForm() {
  const { mutate: sendOtp, isPending } = useSendVerificationOtp();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formSchema>({
    resolver: zodResolver(adminSignupFormSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      user_role: "admin",
    },
  });

  const onSubmit = async (values: formSchema) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/check-email?email=${encodeURIComponent(values.email)}`,
      );
      const { exists } = await res.json();

      if (exists) {
        setError("This email is already registered. Kindly use another email.");
        return;
      }

      sendOtp(values.email, {
        onSuccess: () => {
          sessionStorage.setItem(
            "ocnakLiberiaGradeSystem:pendingUser",
            JSON.stringify({
              firstName: values.first_name,
              lastName: values.last_name,
              userRole: values.user_role,
            }),
          );
          window.location.href = `/auth/verify-otp?email=${encodeURIComponent(values.email)}`;
        },
        onError: (err) => {
          setError(err.message);
        },
      });
    } catch (err) {
      setError("Sign up failed, kindly try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="top-5 w-full border-none">
        <div className="relative w-full">
          <div className="flex items-center justify-between">
            {/* <Link
              href="/admin"
              className="cursor-pointer font-bold transition-all duration-300 hover:underline"
            >
              <FaArrowLeft className="h-4 w-4" />
            </Link> */}

            <p className="text-center text-[13px]">
              Already have an account{" "}
              <Link
                href="/auth/login"
                className="cursor-pointer font-bold transition-all duration-300 hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
        <h3
          className={`${fredoka.className} mt-9 mb-1 text-left text-3xl font-semibold text-[#444]`}
        >
          Welcome to the Oncak Admin Sign-Up Portal
        </h3>

        <p className="text-left text-[14px] font-medium text-[444]">
          Create your account
        </p>

        <form className="mx-1 mt-5 space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <Field data-invalid={!!errors.first_name} className="text-left">
            <FieldLabel className="text-[13px] font-bold text-[#777]">
              First name
            </FieldLabel>
            <Input
              placeholder="John"
              className="h-11 rounded bg-white"
              {...register("first_name")}
            />
            {errors.first_name && (
              <FieldError className="text-red-700">
                {errors.first_name.message}
              </FieldError>
            )}
          </Field>

          <Field data-invalid={!!errors.last_name} className="text-left">
            <FieldLabel className="text-[13px] font-bold text-[#777]">
              Last Name
            </FieldLabel>
            <Input
              placeholder="Doe"
              className="h-11 rounded bg-white"
              {...register("last_name")}
            />
            {errors.last_name && (
              <FieldError className="text-red-700">
                {errors.last_name.message}
              </FieldError>
            )}
          </Field>

          <Field data-invalid={!!errors.email} className="text-left">
            <FieldLabel className="text-[13px] font-bold text-[#777]">
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
                  <p className="text-[12px] font-medium tracking-wide text-red-700">
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
              {isLoading ? <Spinner className="size-7" /> : <span>Submit</span>}
            </RippleButton>
          </div>
        </form>
      </div>
    </>
  );
}
