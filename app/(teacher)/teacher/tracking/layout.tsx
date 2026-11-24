import { Fredoka } from "next/font/google";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getSessionCookie } from "@/lib/prefreshing-components/get-session-cookie";
import { prefetchTeacherClasses } from "@/lib/prefreshing-components/fetch-teacher-classes";
import StudentTrackingMenu from "@/components/student-tracking/student-tracking-menu";
import TeacherTrackingFilters from "./teacher-tracking-filters";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// a layout stays mounted while you switch tabs, so this prefetch runs once.
// The filters, live status and attendance all scope to the teacher's classes.
export default async function TeacherTrackingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();
  const cookie = await getSessionCookie();
  await prefetchTeacherClasses(queryClient, cookie);

  return (
    <div className="text-slate-800 antialiased">
      <section className="mx-auto h-full w-full max-w-285 bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <h1
            className={`${fredoka.className} text-[29px] font-semibold md:text-[35px]`}
          >
            Student Monitoring
          </h1>

          <StudentTrackingMenu role="teacher" />

          <TeacherTrackingFilters />

          {children}
        </HydrationBoundary>
      </section>
    </div>
  );
}
