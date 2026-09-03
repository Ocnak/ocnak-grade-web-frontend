"use client";

import siteLogo from "@/public/images/ocnak-logo.jpeg";
import Image from "next/image";
import Link from "next/link";
// import ResponsiveNavbarMenu from "./ReponsiveNavbarMenu";
import { Fredoka } from "next/font/google";
import { RippleButton } from "@/components/ui/ripple-button";
import { useSession } from "@/hooks/use-session";
import { Spinner } from "@/components/ui/spinner";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function PreviewHeader() {
  const { data: session, isLoading: sessionLoader } = useSession();
  const userRole = session?.user.userRole;

  const getRedirectPath = () => {
    if (!session) return "/auth/login";
    if (userRole === "admin") return "/admin-dashboard/teachers";
    if (userRole === "preschooler-teacher") return "/pre-teacher";
    if (userRole === "teacher") return "/teacher/students";
    return "/auth/login";
  };

  return (
    <>
      <div className="fixed top-0 right-0 left-0 z-50 h-24 border-none bg-white bg-white/70 px-3 shadow-md backdrop-blur-lg md:px-0">
        <header className="mx-auto flex h-full w-full max-w-285 items-center justify-between text-slate-800">
          <div className="flex items-center gap-14">
            <div className="flex items-center justify-center gap-1">
              {/* <ResponsiveNavbarMenu /> */}
              <Link href="/" className="flex items-center gap-1.5">
                <Image src={siteLogo} alt="navbar logo" className="size-10" />
                <p
                  className={`${fredoka.className} hidden text-[20px] leading-none font-semibold tracking-wide text-slate-800 sm:block`}
                >
                  OCNAK
                </p>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-x-5">
            {/* <Link href="/auth/student-login">
              <RippleButton
                variant="ghost"
                className={`h-12 cursor-pointer rounded-md border border-gray-300 px-6 text-[14px] font-semibold text-red-800 shadow transition-all duration-200`}
              >
                For students
              </RippleButton>
            </Link> */}

            <Link href={getRedirectPath()}>
              <RippleButton
                className={`h-12 cursor-pointer rounded-md border-none bg-red-800 px-6 text-[14px] font-semibold text-white shadow transition-all duration-200 hover:border-none hover:bg-slate-800 hover:text-white md:border`}
              >
                {sessionLoader ? (
                  <Spinner className="size-6" />
                ) : session ? (
                  "Dashboard"
                ) : (
                  "Login"
                )}
              </RippleButton>
            </Link>
          </div>
        </header>
      </div>
    </>
  );
}
