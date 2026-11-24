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
  studentByIdKey,
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
  fetchParentMe,
  fetchParentStudentGrades,
  PARENT_ME_QUERY_KEY,
  parentStudentGradesKey,
  type ParentMe,
} from "@/lib/prefreshing-components/fetch-parents";
import ViewStudentMain from "./view-student-main";

const STALE = 1000 * 60 * 180;

export default async function ParentViewStudentGradePage({
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
        queryKey: PARENT_ME_QUERY_KEY,
        queryFn: () => fetchParentMe(cookie),
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

    // subjects depend on the student's class, grades on the parent's id
    const student = queryClient.getQueryData<any>(studentByIdKey(studentId));
    const classId: string | undefined = student?.students?.classesId;
    const parentId =
      queryClient.getQueryData<ParentMe>(PARENT_ME_QUERY_KEY)?.id;

    await Promise.all([
      classId
        ? queryClient.prefetchQuery({
            queryKey: subjectsByClassKey(classId),
            queryFn: () => fetchSubjectsByClass(classId, cookie),
          })
        : null,
      parentId
        ? queryClient.prefetchQuery({
            queryKey: parentStudentGradesKey(parentId, studentId),
            queryFn: () =>
              fetchParentStudentGrades(parentId, studentId, cookie),
          })
        : null,
    ]);
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
