import { Fredoka } from "next/font/google";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getSessionCookie } from "@/lib/prefreshing-components/get-session-cookie";
import {
  fetchStudents,
  STUDENTS_QUERY_KEY,
} from "@/lib/prefreshing-components/fetch-students";
import {
  fetchTeachers,
  TEACHERS_QUERY_KEY,
} from "@/lib/prefreshing-components/fetch-teachers";
import {
  fetchParentsWithStudents,
  PARENTS_WITH_STUDENTS_QUERY_KEY,
} from "@/lib/prefreshing-components/fetch-parents";
import {
  fetchScanners,
  SCANNERS_QUERY_KEY,
} from "@/lib/prefreshing-components/fetch-scanners";
import {
  CLASSES_QUERY_KEY,
  fetchClasses,
} from "@/lib/prefreshing-components/fetch-classes";
import {
  ACADEMIC_SETTINGS_QUERY_KEY,
  fetchAcademicSettings,
} from "@/lib/prefreshing-components/fetch-academic-settings";
import OverviewMain from "./overview-main";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default async function OverviewPage() {
  const queryClient = new QueryClient();
  const cookie = await getSessionCookie();

  // failures are fine: the client fetches whatever is missing
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: STUDENTS_QUERY_KEY,
      queryFn: () => fetchStudents(cookie),
    }),
    queryClient.prefetchQuery({
      queryKey: TEACHERS_QUERY_KEY,
      queryFn: () => fetchTeachers(cookie),
    }),
    queryClient.prefetchQuery({
      queryKey: PARENTS_WITH_STUDENTS_QUERY_KEY,
      queryFn: () => fetchParentsWithStudents(cookie),
    }),
    queryClient.prefetchQuery({
      queryKey: SCANNERS_QUERY_KEY,
      queryFn: () => fetchScanners(cookie),
    }),
    queryClient.prefetchQuery({
      queryKey: CLASSES_QUERY_KEY,
      queryFn: () => fetchClasses(cookie),
    }),
    queryClient.prefetchQuery({
      queryKey: ACADEMIC_SETTINGS_QUERY_KEY,
      queryFn: () => fetchAcademicSettings(cookie),
    }),
  ]);

  return (
    <main className="h-full w-full bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
      <h1
        className={`${fredoka.className} text-[29px] font-semibold md:text-[35px]`}
      >
        Dashboard
      </h1>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <OverviewMain />
      </HydrationBoundary>
    </main>
  );
}
