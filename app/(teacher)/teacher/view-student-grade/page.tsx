import { Suspense } from "react";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { getSessionCookie } from "@/lib/prefreshing-components/get-session-cookie";
import {
  fetchStudentById,
  fetchStudentsByClass,
  studentByIdKey,
  studentsByClassKey,
} from "@/lib/prefreshing-components/fetch-student-view";
import {
  CLASSES_QUERY_KEY,
  fetchClasses,
} from "@/lib/prefreshing-components/fetch-classes";
import {
  fetchPeriods,
  PERIODS_QUERY_KEY,
} from "@/lib/prefreshing-components/fetch-periods";
import {
  fetchSubjectsByClass,
  subjectsByClassKey,
} from "@/lib/prefreshing-components/fetch-subjects";
import {
  fetchStudentGrades,
  studentGradesKey,
} from "@/lib/prefreshing-components/fetch-student-grades";
import ViewStudentMain from "./view-student-main";

const STALE = 1000 * 60 * 180;

export default async function TeacherViewStudentGradePage({
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
    const cookie = await getSessionCookie();

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
      queryClient.prefetchQuery({
        queryKey: PERIODS_QUERY_KEY,
        queryFn: () => fetchPeriods(cookie),
      }),
      queryClient.prefetchQuery({
        queryKey: studentGradesKey(studentId),
        queryFn: () => fetchStudentGrades(studentId, cookie),
      }),
    ]);

    // classmates and subjects depend on the student's class
    const student = queryClient.getQueryData<any>(studentByIdKey(studentId));
    const classId: string | undefined = student?.students?.classesId;

    if (classId) {
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: studentsByClassKey(classId),
          queryFn: () => fetchStudentsByClass(classId, cookie),
        }),
        queryClient.prefetchQuery({
          queryKey: subjectsByClassKey(classId),
          queryFn: () => fetchSubjectsByClass(classId, cookie),
        }),
      ]);
    }
  }

  return (
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
  );
}
