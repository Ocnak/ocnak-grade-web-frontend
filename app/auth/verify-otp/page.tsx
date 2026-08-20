import VerifyOTPForm from "./verify-otp-form";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function VerifyOTPPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-gray-100 text-slate-800 antialiased">
      <main className="grid h-screen w-full grid-cols-1 gap-0 bg-white md:h-auto md:w-134 md:rounded-[10px] md:border-gray-300 md:shadow-lg">
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center">
              <Spinner className="size-18" />
            </div>
          }
        >
          <VerifyOTPForm />
        </Suspense>
      </main>
    </section>
  );
}
