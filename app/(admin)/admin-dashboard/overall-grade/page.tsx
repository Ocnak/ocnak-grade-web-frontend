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
  fetchClasses,
  CLASSES_QUERY_KEY,
} from "@/lib/prefreshing-components/fetch-classes";
import {
  fetchPeriods,
  PERIODS_QUERY_KEY,
} from "@/lib/prefreshing-components/fetch-periods";
import OverallClassSelect from "./overall-class-select";
import OverallPeriodSelect from "./overall-period-select";
import OverallLocationSelect from "./overall-location-select";
import OverallPublishAction from "./overall-publish-action";
import OverallMainContent from "./overall-main-content";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default async function OverallGradePage() {
  const queryClient = new QueryClient();
  const cookie = await getSessionCookie();

  // grades and subjects depend on the class/period picked on the client, so only
  // the filter-independent lists are prefetched; a failure just means the client fetches it
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: STUDENTS_QUERY_KEY,
      queryFn: () => fetchStudents(cookie),
    }),
    queryClient.prefetchQuery({
      queryKey: CLASSES_QUERY_KEY,
      queryFn: () => fetchClasses(cookie),
    }),
    queryClient.prefetchQuery({
      queryKey: PERIODS_QUERY_KEY,
      queryFn: () => fetchPeriods(cookie),
    }),
  ]);

  return (
    <div className="text-slate-800 antialiased">
      <main className="h-full w-full bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <h1
            className={`${fredoka.className} text-[29px] font-semibold md:text-[35px]`}
          >
            Overall Grade
          </h1>

          <div className="mt-11.25  grid w-full grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="w-full space-x-4 space-y-4">
              <OverallClassSelect />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
              <OverallPeriodSelect />
              <OverallLocationSelect />
              <div className="grid col-span-2">
                <OverallPublishAction />
              </div>
            </div>
          </div>

          <OverallMainContent />
        </HydrationBoundary>
      </main>
    </div>
  );
}
