"use client";

import { Fredoka } from "next/font/google";
import { Button } from "@base-ui/react";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function HeroSection() {
  const router = useRouter();

  return (
    <div className="text-slate-800 mt-7 flex flex-col items-center justify-center ">
      <h1
        className={`${fredoka.className} text-7xl font-semibold md:text-9xl `}
      >
        40<span className="text-red-700">3</span>
      </h1>

      <h3
        className={`text-3xl font-semibold tracking-tight text-center ${fredoka.className}`}
      >
        Access Denied
      </h3>
      <p className="text-slate-500 mt-2 mb-5 max-w-sm text-center text-base">
        You don't have permission to view this page.
      </p>

      <Button
        onClick={() => router.back()}
        className="h-12.5 w-44 flex gap-2 items-center justify-center cursor-pointer rounded-md bg-slate-800  font-medium tracking-wide text-white transition-all duration-200 hover:bg-slate-700"
      >
        <ArrowLeftIcon className="size-5" />
        Go Back
      </Button>
    </div>
  );
}
