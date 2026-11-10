import { Suspense } from "react";
import { cookies } from "next/headers";
import { Tinos } from "next/font/google";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import ViewStudentMain from "./view-student-main";
import {
  CLASSES_QUERY_KEY,
  fetchClasses,
  fetchStudentById,
  fetchStudentsByClass,
  studentByIdKey,
  studentsByClassKey,
} from "@/lib/prefreshing-components/fetch-student-view";

const tinos = Tinos({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const STALE = 1000 * 60 * 180;

export default async function ViewStudentPage({
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

  const cookie = (await cookies()).toString();

  if (studentId) {
    // Student + classes in parallel
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

    // Classmates depend on the student's classId
    const student = queryClient.getQueryData<any>(studentByIdKey(studentId));
    const classId: string | undefined = student?.students?.classesId;

    if (classId) {
      await queryClient.prefetchQuery({
        queryKey: studentsByClassKey(classId),
        queryFn: () => fetchStudentsByClass(classId, cookie),
      });
    }
  }

  return (
    <main
      className={`${tinos.className} h-full bg-[#f9faf8] px-1.5 py-3 text-[#4a4442] antialiased md:px-[25px] md:py-6`}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense
          fallback={
            <div className="mt-32.5 flex w-full items-center justify-center">
              <Spinner className="size-19" />
            </div>
          }
        >
          <ViewStudentMain />
        </Suspense>
      </HydrationBoundary>
    </main>
  );
}
