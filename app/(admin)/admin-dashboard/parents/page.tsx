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
  fetchParentsWithStudents,
  PARENTS_WITH_STUDENTS_QUERY_KEY,
} from "@/lib/prefreshing-components/fetch-parents";
import ParentMain from "./parent-main";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default async function ParentsPage() {
  const queryClient = new QueryClient();
  const cookie = await getSessionCookie();

  // the requests run at the same time; a failure just means the client fetches it instead
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: PARENTS_WITH_STUDENTS_QUERY_KEY,
      queryFn: () => fetchParentsWithStudents(cookie),
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
          Parents Details
        </h1>

        <ParentMain />
      </HydrationBoundary>
    </main>
  );
}
