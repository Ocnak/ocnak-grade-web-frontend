import { Suspense } from "react";
import { cookies } from "next/headers";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import StudentDetailMain from "@/components/student-detail/student-detail-main";
import {
  CLASSES_QUERY_KEY,
  fetchClasses,
  fetchStudentById,
  studentByIdKey,
} from "@/lib/prefreshing-components/fetch-student-view";

const STALE = 1000 * 60 * 180;

export default async function AdminStudentDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const studentId =
    typeof params.studentId === "string" ? params.studentId : null;

  // One QueryClient per request — never share across users
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: STALE } },
  });

  if (studentId) {
    const cookie = (await cookies()).toString();
    // failures are fine: the client refetches
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: studentByIdKey(studentId),
        queryFn: () => fetchStudentById(studentId, cookie),
      }),
      queryClient.prefetchQuery({
        queryKey: CLASSES_QUERY_KEY,
        queryFn: () => fetchClasses(cookie),
      }),
    ]);
  }

  return (
    <main className="h-full w-full bg-[#f9faf8] px-3.75 py-3 text-slate-800 antialiased md:px-6.25 md:py-6">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense
          fallback={
            <div className="mt-32.5 flex w-full items-center justify-center">
              <Spinner className="size-19" />
            </div>
          }
        >
          <StudentDetailMain
            studentsHref="/admin-dashboard/students"
            gradesHref="/admin-dashboard/view-student-grade"
          />
        </Suspense>
      </HydrationBoundary>
    </main>
  );
}
