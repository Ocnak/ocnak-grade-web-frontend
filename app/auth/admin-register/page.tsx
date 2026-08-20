import Image from "next/image";
import AdminSignupForm from "./AdminSignupForm";

export default function AdminSignup() {
  return (
    <>
      <div className="flex h-screen items-center justify-center text-slate-800">
        <div className="z-0 mx-auto grid h-150 w-full max-w-310 grid-cols-1 gap-2 md:grid-cols-2">
          <div className="m-6 hidden items-center justify-center rounded-lg bg-[#1B4965] bg-cover bg-center md:flex">
            <Image
              src="/images/undraw_online-survey_xq2g.svg"
              alt="password form image"
              width={3000}
              height={3000}
              loading="eager"
              priority
              className="h-70 w-70"
            />
          </div>
          <div className="px-4 md:px-5 md:py-10">
            <AdminSignupForm />
          </div>
        </div>
      </div>
    </>
  );
}
