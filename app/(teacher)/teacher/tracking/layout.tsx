import { Fredoka } from "next/font/google";
import StudentTrackingMenu from "@/components/student-tracking/student-tracking-menu";
import TeacherTrackingFilters from "./teacher-tracking-filters";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function TeacherTrackingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="text-slate-800 antialiased">
      <section className="mx-auto h-full w-full max-w-285 bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
        <h1
          className={`${fredoka.className} text-[29px] font-semibold md:text-[35px]`}
        >
          Student Monitoring
        </h1>

        <StudentTrackingMenu role="teacher" />

        <TeacherTrackingFilters />

        {children}
      </section>
    </div>
  );
}
