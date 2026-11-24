import { Fredoka } from "next/font/google";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getSessionCookie } from "@/lib/prefreshing-components/get-session-cookie";
import {
  fetchClasses,
  CLASSES_QUERY_KEY,
} from "@/lib/prefreshing-components/fetch-classes";
import {
  fetchHonorStudents,
  HONOR_STUDENTS_QUERY_KEY,
} from "@/lib/prefreshing-components/fetch-honor-students";
import {
  fetchPeriods,
  PERIODS_QUERY_KEY,
} from "@/lib/prefreshing-components/fetch-periods";
import StarStudentsMain from "./star-students-main";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default async function StarStudentsBoardPage() {
  const queryClient = new QueryClient();
  const cookie = await getSessionCookie();

  // the requests run at the same time; a failure just means the client fetches it instead
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: HONOR_STUDENTS_QUERY_KEY,
      queryFn: () => fetchHonorStudents(cookie),
    }),
    queryClient.prefetchQuery({
      queryKey: PERIODS_QUERY_KEY,
      queryFn: () => fetchPeriods(cookie),
    }),
    queryClient.prefetchQuery({
      queryKey: CLASSES_QUERY_KEY,
      queryFn: () => fetchClasses(cookie),
    }),
  ]);

  return (
    <main className="h-full w-full bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <h1
          className={`${fredoka.className} text-[29px] font-semibold md:text-[35px]`}
        >
          Star Students Board
        </h1>

        <StarStudentsMain />
      </HydrationBoundary>
    </main>
  );
}
