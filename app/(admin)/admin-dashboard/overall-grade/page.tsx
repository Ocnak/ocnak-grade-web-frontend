"use client";

import { Fredoka } from "next/font/google";
import OverallClassSelect from "./overall-class-select";
import OverallPeriodSelect from "./overall-period-select";
import OverallGradesRecord from "./overall-grade-record";
import { useFilterStore } from "@/store/filterStore";
import Image from "next/image";
import PublishStudentGradeModal from "./publish-student-grades-modal";
import UnPublishStudentGradeModal from "./unpublish-student-grades-modal";
import { useGradesByPeriod } from "@/hooks/use-student-grades";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function OverallGradePage() {
  const { className: classId, periodId } = useFilterStore();

  const { data: periodGrades, isLoading: periodGradesLoader } =
    useGradesByPeriod(periodId, classId);

  const isApproved =
    !!periodGrades &&
    periodGrades.length > 0 &&
    periodGrades.every((g: any) => g.status === "approved");

  return (
    <>
      <main className="h-full w-full bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
        <h1
          className={`${fredoka.className} text-[29px] font-semibold md:text-[35px]`}
        >
          Overall Grade
        </h1>

        <div className="gap-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 w-full mt-4">
          <OverallClassSelect />
          <OverallPeriodSelect />
          {periodGradesLoader ? (
            <div className="h-12 rounded-md bg-gray-400 animate-pulse" />
          ) : isApproved ? (
            <UnPublishStudentGradeModal />
          ) : (
            <PublishStudentGradeModal />
          )}
        </div>

        {!classId ? (
          <div
            className={`mt-15 flex w-full flex-col items-center justify-center gap-2 text-[22px] font-semibold text-slate-800 ${fredoka.className}`}
          >
            <Image
              src="/images/undraw_my-answer_au1h.svg"
              alt="empty rooster image"
              width={300}
              height={300}
              className="h-auto w-56 md:w-64 lg:size-66"
              priority
              quality={75}
              sizes="(max-width: 640px) 160px, (max-width: 768px) 224px, (max-width: 1024px) 256px, 264px"
            />

            <h1 className="text-center text-[22px] font-semibold md:text-[26px]">
              Choose a class to display the student roster.
            </h1>
          </div>
        ) : (
          <div className="my-4 rounded-md border border-gray-300 shadow-md">
            <OverallGradesRecord classId={classId} periodId={periodId} />
          </div>
        )}
      </main>
    </>
  );
}
