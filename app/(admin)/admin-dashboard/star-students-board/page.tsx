"use client";

import { Fredoka } from "next/font/google";
import Image from "next/image";
import StudentClassSelect from "./student-class-select";
import SelectHonorListing from "./select-honor-listing";
import StudentPeriodSelect from "./student-period-select";
import { useFilterStore } from "@/store/filterStore";
import { useFetchHonorStudents } from "@/hooks/use-student-grades";
import LoadingCircleSpinner from "@/components/animation/LoadingCircleSpinner";
import { useMemo } from "react";
import StarStudentsRecord from "./star-students-record";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function page() {
  const { className: classId, periodId, academicListing } = useFilterStore();

  const {
    data: students,
    isLoading: studentsLoader,
    error: studentsError,
  } = useFetchHonorStudents();

  // Filter the data based on the store values
  const filteredStudents = useMemo(() => {
    if (!students) return [];

    return students
      .filter((student: any) => {
        const matchesClass = !classId || student.class_id === classId;
        const matchesPeriod = !periodId || student.period_id === periodId;
        const matchesListing =
          !academicListing || student.honor_category === academicListing;

        return matchesClass && matchesPeriod && matchesListing;
      })
      .map((student: any) => {
        const isNursery =
          student.class_name.toLowerCase().includes("nursery") ||
          student.class_name.toLowerCase().includes("pre-nursery");

        return {
          ...student,
          avg_numeric: isNursery ? null : student.avg_numeric,
          count_as: isNursery ? student.count_as : null,
        };
      })
      .sort((a: any, b: any) => {
        if (a.avg_numeric != null || b.avg_numeric != null) {
          return (b.avg_numeric || 0) - (a.avg_numeric || 0);
        }
        return (b.count_as || 0) - (a.count_as || 0);
      });
  }, [students, classId, periodId, academicListing]);

  if (studentsLoader) {
    return (
      <div className="mt-32.5 flex w-full items-center justify-center">
        <LoadingCircleSpinner />
      </div>
    );
  }

  if (studentsError)
    return <div>Error fetching data: {studentsError.message}</div>;

  return (
    <main className="mt-18 h-full w-full bg-[#f9faf8] px-3.75 py-3 md:px-6.25 md:py-6">
      <h1
        className={`${fredoka.className} text-[29px] font-semibold md:text-[35px]`}
      >
        Star Students Board
      </h1>

      <div className="mt-10.25 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="w-full md:max-w-108 sm:max-w-90">
          <StudentClassSelect />
        </div>

        <div className="grid grid-cols-2 gap-3 ">
          <SelectHonorListing />
          <StudentPeriodSelect />
        </div>
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
        <div className="mt-7">
          <StarStudentsRecord
            data={filteredStudents}
            classId={classId}
            periodId={periodId}
            academicListing={academicListing}
          />
        </div>
      )}
    </main>
  );
}
