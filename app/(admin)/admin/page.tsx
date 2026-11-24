import { Outfit } from "next/font/google";
import { Suspense } from "react";
import LoginForm from "@/app/auth/login/LoginForm";
import { Spinner } from "@/components/ui/spinner";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export default function LandingPage() {
  return (
    <>
      <section
        className={`${outfit.className} flex min-h-screen items-center justify-center bg-gray-100 text-slate-800 antialiased`}
      >
        <main className="grid h-screen w-full grid-cols-1 gap-0 bg-white md:h-auto md:w-[527px] md:rounded-[1rem] md:border-gray-300 md:shadow-lg">
          {/* LoginForm reads search params, which needs a Suspense boundary */}
          <Suspense
            fallback={
              <div className="flex h-screen items-center justify-center">
                <Spinner className="size-18" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </main>
      </section>
    </>
  );
}
