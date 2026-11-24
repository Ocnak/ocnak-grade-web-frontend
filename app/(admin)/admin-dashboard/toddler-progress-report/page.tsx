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
  DEFAULT_PRESCHOOLER_SEMESTER,
  fetchPreschoolerAnswers,
  fetchPreschoolerQuestions,
  preschoolerAnswersKey,
  PRESCHOOLER_QUESTIONS_QUERY_KEY,
} from "@/lib/prefreshing-components/fetch-preschooler";
import ToddlerProgressReportMain from "./toddler-progress-report-main";

const STALE = 1000 * 60 * 180;

export default async function AdminToddlerProgressReportPage({
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

    // failures are fine: the client refetches.
    // Answers are for the default semester, the one shown until another is picked.
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: studentByIdKey(studentId),
        queryFn: () => fetchStudentById(studentId, cookie),
      }),
      queryClient.prefetchQuery({
        queryKey: PRESCHOOLER_QUESTIONS_QUERY_KEY,
        queryFn: () => fetchPreschoolerQuestions(cookie),
      }),
      queryClient.prefetchQuery({
        queryKey: preschoolerAnswersKey(
          studentId,
          DEFAULT_PRESCHOOLER_SEMESTER,
        ),
        queryFn: () =>
          fetchPreschoolerAnswers(
            studentId,
            DEFAULT_PRESCHOOLER_SEMESTER,
            cookie,
          ),
      }),
    ]);

    // classmates depend on the student's class
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
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={
          <div className="mt-32.5 flex w-full items-center justify-center">
            <Spinner className="size-19" />
          </div>
        }
      >
        <ToddlerProgressReportMain />
      </Suspense>
    </HydrationBoundary>
  );
}
